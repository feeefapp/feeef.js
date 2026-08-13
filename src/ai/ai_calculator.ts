/**
 * Client-side AI cost estimator — deterministic mirror of the backend engine
 * in `backend/app/services/ai_calculator.ts`.
 *
 * The backend quote is always authoritative (it performs the wallet debit);
 * this class exists so UIs can show "you will pay X DZD" before generating,
 * with the SAME formulas and the SAME config inputs (`aiModels` + `models`
 * catalog from the app-config endpoint). No network calls, no side effects.
 *
 * ## Money model (identical to backend)
 *
 * ```
 * provider cost (USD)                 what the AI provider charges
 *   × exchangeRate                    → provider cost (DZD)
 *   × retailMarkup.multiplier         → retail user cost (DZD)
 *   + flat retail add-ons (DZD)       reference images, resolution tiers,
 *                                     feature add-ons, attachment surcharge…
 *   = userCostDzd
 * ```
 *
 * Invariants:
 *  1. `providerCostUsd`/`providerCostDzd` are ALWAYS the pre-markup provider
 *     cost; `0` when unknown (retail floors) — never back-computed from the
 *     retail price.
 *  2. `userCostDzd` is the final retail amount, rounded to 3 decimals.
 *
 * ## Pricing precedence (identical to backend)
 *
 *  - **Text**  : legacy exact-id row (context tiers) → catalog
 *    `pricing.prompt/completion` → named default legacy row
 *    (`gemini-flash-lite-latest`) → free. Never `models[0]`.
 *  - **Image** : catalog (`image_output_per_size_usd` → `image_output`) →
 *    legacy exact-id `unit:'image'` row → `defaultImageCost` floor.
 *    Legacy `localCost` (DZD) stays an explicit retail override.
 *  - **Voice** : legacy row (`localCost` → flat `audio`/`voice` USD → `image`
 *    unit for voice-capable rows → `tokens` per-1M), floored by
 *    `voiceGeneration.minimumChargeUsd` unless `localCost` is set.
 *
 * Canonical `aiModels.billing` keys — keep in sync: backend
 * `ai_models_billing.ts`, feeef.dart `ai_calculator.dart`, admins_dashboard
 * `useOptions.ts`.
 */

import { ModelsCatalogConfig, ModelCatalogRow } from '../core/models_catalog.js'

/** Fallback DZD per USD when `aiModels.exchangeRate` is missing (mirror backend). */
export const FALLBACK_AI_EXCHANGE_RATE = 260

// --- Canonical partial billing (from DB / JSON) --------------------------------

export interface RetailMarkupBilling {
  multiplier?: number
}

export interface ReferenceAttachmentSurchargeBilling {
  perFileUsd?: number
  highResolutionExtraPerFileUsd?: number
  lowResolutionDiscountPerFileUsd?: number
}

export interface ImageGenerationBilling {
  fallbackProviderCostPerImageUsd?: number
}

export interface TextGenerationBilling {
  freeTierMaxPromptTokens?: number
  estimatedPromptTokensDefault?: number
  estimatedOutputTokensDefault?: number
}

export interface TtsTokenEstimateBilling {
  whenScriptEmptyTokens?: number
  whenAttachmentsOnlyTokens?: number
  promptBaseTokens?: number
  promptPerAttachmentTokens?: number
  outputMinimumTokens?: number
  outputToTextTokenRatio?: number
  maxTotalTokens?: number
}

export interface VoiceGenerationBilling {
  minimumChargeUsd?: number
  scriptEnhancementAddonUsd?: number
  ttsTokenEstimate?: TtsTokenEstimateBilling
}

export interface LandingPageImageBilling {
  fixedChargeUsd?: number
}

export interface AIModelsBilling {
  retailMarkup?: RetailMarkupBilling
  referenceAttachmentSurcharge?: ReferenceAttachmentSurchargeBilling
  imageGeneration?: ImageGenerationBilling
  textGeneration?: TextGenerationBilling
  voiceGeneration?: VoiceGenerationBilling
  landingPageImage?: LandingPageImageBilling
}

/** Fully resolved billing after merge (stable export for callers/tests). */
export interface ResolvedAiModelsBilling {
  retailMarkup: { multiplier: number }
  referenceAttachmentSurcharge: {
    perFileUsd: number
    highResolutionExtraPerFileUsd: number
    lowResolutionDiscountPerFileUsd: number
  }
  imageGeneration: { fallbackProviderCostPerImageUsd: number }
  textGeneration: {
    freeTierMaxPromptTokens: number
    estimatedPromptTokensDefault: number
    estimatedOutputTokensDefault: number
  }
  voiceGeneration: {
    minimumChargeUsd: number
    scriptEnhancementAddonUsd: number
    ttsTokenEstimate: Required<TtsTokenEstimateBilling>
  }
  landingPageImage: { fixedChargeUsd: number }
}

const DEFAULT_TTS: Required<TtsTokenEstimateBilling> = {
  whenScriptEmptyTokens: 200,
  whenAttachmentsOnlyTokens: 400,
  promptBaseTokens: 400,
  promptPerAttachmentTokens: 300,
  outputMinimumTokens: 300,
  outputToTextTokenRatio: 2.5,
  maxTotalTokens: 32_000,
}

const DEFAULT_RESOLVED: ResolvedAiModelsBilling = {
  retailMarkup: { multiplier: 2.5 },
  referenceAttachmentSurcharge: {
    perFileUsd: 0.1,
    highResolutionExtraPerFileUsd: 0.05,
    lowResolutionDiscountPerFileUsd: 0.05,
  },
  imageGeneration: { fallbackProviderCostPerImageUsd: 0.131 },
  textGeneration: {
    freeTierMaxPromptTokens: 1000,
    estimatedPromptTokensDefault: 2000,
    estimatedOutputTokensDefault: 1000,
  },
  voiceGeneration: {
    minimumChargeUsd: 50 / FALLBACK_AI_EXCHANGE_RATE,
    scriptEnhancementAddonUsd: 25 / FALLBACK_AI_EXCHANGE_RATE,
    ttsTokenEstimate: { ...DEFAULT_TTS },
  },
  landingPageImage: {
    fixedChargeUsd: 100 / FALLBACK_AI_EXCHANGE_RATE,
  },
}

function mergeTts(
  base: Required<TtsTokenEstimateBilling>,
  partial?: TtsTokenEstimateBilling | null
): Required<TtsTokenEstimateBilling> {
  if (!partial) return { ...base }
  return {
    whenScriptEmptyTokens: partial.whenScriptEmptyTokens ?? base.whenScriptEmptyTokens,
    whenAttachmentsOnlyTokens: partial.whenAttachmentsOnlyTokens ?? base.whenAttachmentsOnlyTokens,
    promptBaseTokens: partial.promptBaseTokens ?? base.promptBaseTokens,
    promptPerAttachmentTokens: partial.promptPerAttachmentTokens ?? base.promptPerAttachmentTokens,
    outputMinimumTokens: partial.outputMinimumTokens ?? base.outputMinimumTokens,
    outputToTextTokenRatio: partial.outputToTextTokenRatio ?? base.outputToTextTokenRatio,
    maxTotalTokens: partial.maxTotalTokens ?? base.maxTotalTokens,
  }
}

/**
 * Deep-merge optional server `billing` over platform defaults.
 * Omit or pass `null` to get code defaults only.
 */
export function mergeAiModelsBilling(partial?: AIModelsBilling | null): ResolvedAiModelsBilling {
  const d = DEFAULT_RESOLVED
  if (!partial) return structuredClone(d)

  const v = partial.voiceGeneration
  const tts = mergeTts(d.voiceGeneration.ttsTokenEstimate, v?.ttsTokenEstimate)

  return {
    retailMarkup: {
      multiplier: partial.retailMarkup?.multiplier ?? d.retailMarkup.multiplier,
    },
    referenceAttachmentSurcharge: {
      perFileUsd:
        partial.referenceAttachmentSurcharge?.perFileUsd ??
        d.referenceAttachmentSurcharge.perFileUsd,
      highResolutionExtraPerFileUsd:
        partial.referenceAttachmentSurcharge?.highResolutionExtraPerFileUsd ??
        d.referenceAttachmentSurcharge.highResolutionExtraPerFileUsd,
      lowResolutionDiscountPerFileUsd:
        partial.referenceAttachmentSurcharge?.lowResolutionDiscountPerFileUsd ??
        d.referenceAttachmentSurcharge.lowResolutionDiscountPerFileUsd,
    },
    imageGeneration: {
      fallbackProviderCostPerImageUsd:
        partial.imageGeneration?.fallbackProviderCostPerImageUsd ??
        d.imageGeneration.fallbackProviderCostPerImageUsd,
    },
    textGeneration: {
      freeTierMaxPromptTokens:
        partial.textGeneration?.freeTierMaxPromptTokens ?? d.textGeneration.freeTierMaxPromptTokens,
      estimatedPromptTokensDefault:
        partial.textGeneration?.estimatedPromptTokensDefault ??
        d.textGeneration.estimatedPromptTokensDefault,
      estimatedOutputTokensDefault:
        partial.textGeneration?.estimatedOutputTokensDefault ??
        d.textGeneration.estimatedOutputTokensDefault,
    },
    voiceGeneration: {
      minimumChargeUsd: v?.minimumChargeUsd ?? d.voiceGeneration.minimumChargeUsd,
      scriptEnhancementAddonUsd:
        v?.scriptEnhancementAddonUsd ?? d.voiceGeneration.scriptEnhancementAddonUsd,
      ttsTokenEstimate: tts,
    },
    landingPageImage: {
      fixedChargeUsd: partial.landingPageImage?.fixedChargeUsd ?? d.landingPageImage.fixedChargeUsd,
    },
  }
}

/** Legacy flat keys for older importers (DZD leaves use `exchangeRate`). */
export interface LegacyAiBillingFlat {
  MULTIPLIER: number
  FREE_TEXT_TOKENS_THRESHOLD: number
  DEFAULT_EXCHANGE_RATE: number
  DEFAULT_GOOGLE_IMAGE_COST_USD: number
  DEFAULT_ATTACHMENT_COST_USD: number
  ATTACHMENT_HIGH_RES_EXTRA_USD: number
  ATTACHMENT_LOW_RES_DISCOUNT_USD: number
  VOICEOVER_FIXED_COST_DZD: number
  VOICEOVER_ENHANCE_ADDON_DZD: number
  IMAGE_LANDING_PAGE_FIXED_COST_DZD: number
  DEFAULT_TEXT_PROMPT_TOKENS: number
  DEFAULT_TEXT_OUTPUT_TOKENS: number
  VOICE_TTS_EMPTY_SCRIPT_TEXT_TOKENS: number
  VOICE_TTS_ATTACHMENT_ONLY_TEXT_TOKENS: number
  VOICE_TTS_PROMPT_BASE: number
  VOICE_TTS_PROMPT_PER_ATTACHMENT: number
  VOICE_TTS_OUTPUT_MIN: number
  VOICE_TTS_OUTPUT_TEXT_FACTOR: number
  VOICE_TTS_TOKEN_CAP: number
}

/** Round money to [precision] decimals (mirror backend `roundMoney`). */
function roundMoney(amount: number, precision = 3): number {
  const factor = 10 ** precision
  return Math.round((amount + Number.EPSILON) * factor) / factor
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/** @deprecated Prefer `mergeAiModelsBilling` + `ResolvedAiModelsBilling`. */
export function getLegacyAiBillingFlat(
  exchangeRate: number,
  resolved: ResolvedAiModelsBilling = mergeAiModelsBilling(null)
): LegacyAiBillingFlat {
  const t = resolved.voiceGeneration.ttsTokenEstimate
  return {
    MULTIPLIER: resolved.retailMarkup.multiplier,
    FREE_TEXT_TOKENS_THRESHOLD: resolved.textGeneration.freeTierMaxPromptTokens,
    DEFAULT_EXCHANGE_RATE: FALLBACK_AI_EXCHANGE_RATE,
    DEFAULT_GOOGLE_IMAGE_COST_USD: resolved.imageGeneration.fallbackProviderCostPerImageUsd,
    DEFAULT_ATTACHMENT_COST_USD: resolved.referenceAttachmentSurcharge.perFileUsd,
    ATTACHMENT_HIGH_RES_EXTRA_USD:
      resolved.referenceAttachmentSurcharge.highResolutionExtraPerFileUsd,
    ATTACHMENT_LOW_RES_DISCOUNT_USD:
      resolved.referenceAttachmentSurcharge.lowResolutionDiscountPerFileUsd,
    VOICEOVER_FIXED_COST_DZD: roundMoney(
      resolved.voiceGeneration.minimumChargeUsd * exchangeRate,
      3
    ),
    VOICEOVER_ENHANCE_ADDON_DZD: roundMoney(
      resolved.voiceGeneration.scriptEnhancementAddonUsd * exchangeRate,
      3
    ),
    IMAGE_LANDING_PAGE_FIXED_COST_DZD: roundMoney(
      resolved.landingPageImage.fixedChargeUsd * exchangeRate,
      3
    ),
    DEFAULT_TEXT_PROMPT_TOKENS: resolved.textGeneration.estimatedPromptTokensDefault,
    DEFAULT_TEXT_OUTPUT_TOKENS: resolved.textGeneration.estimatedOutputTokensDefault,
    VOICE_TTS_EMPTY_SCRIPT_TEXT_TOKENS: t.whenScriptEmptyTokens,
    VOICE_TTS_ATTACHMENT_ONLY_TEXT_TOKENS: t.whenAttachmentsOnlyTokens,
    VOICE_TTS_PROMPT_BASE: t.promptBaseTokens,
    VOICE_TTS_PROMPT_PER_ATTACHMENT: t.promptPerAttachmentTokens,
    VOICE_TTS_OUTPUT_MIN: t.outputMinimumTokens,
    VOICE_TTS_OUTPUT_TEXT_FACTOR: t.outputToTextTokenRatio,
    VOICE_TTS_TOKEN_CAP: t.maxTotalTokens,
  }
}

/**
 * @deprecated Prefer `mergeAiModelsBilling` + `ResolvedAiModelsBilling`.
 * Snapshot of defaults at `FALLBACK_AI_EXCHANGE_RATE` for DZD-derived fields.
 */
export const AI_BILLING: LegacyAiBillingFlat = getLegacyAiBillingFlat(FALLBACK_AI_EXCHANGE_RATE)

// --- Model config shapes --------------------------------------------------------

export interface AiModelPricing {
  /** USD per 1M tokens (`unit: 'tokens'`) — `input` prompt / `output` completion. */
  input?: number
  /** For `unit: 'image' | 'audio' | 'voice'`: USD per single generation. */
  output?: number
  unit: string
  /** Optional context tier, e.g. `<=200K` / `>200K` (tokens unit only). */
  contextThreshold?: string
}

/**
 * Optional operator overrides for Gemini image-generation Google Search grounding.
 * Shapes `aiModels.models[].tools` from the app config API — same as backend `AIModel.tools`.
 * Undefined keys mean "use platform default for this model id" (see backend `gemini_image_grounding`).
 */
export interface AiModelTools {
  googleSearch?: boolean
  googleImageSearch?: boolean
}

export interface AiModelConfig {
  id: string
  pricing?: AiModelPricing[]
  /** Explicit admin retail price (DZD) for one generation — overrides computed retail. */
  localCost?: number | null
  /** From aiModels — used so TTS billing does not fall back to the first (often image) row. */
  capabilities?: string[]
  tools?: AiModelTools
}

export interface AiCalculatorConfig {
  exchangeRate?: number
  /** Floor retail-provider DZD for one image when no source prices the model. */
  defaultImageCost?: number
  /** Flat retail DZD per reference image. */
  referenceImageCost?: number
  /** Flat retail DZD per resolution tier (`MEDIA_RESOLUTION_LOW|MEDIUM|HIGH`). */
  resolutionCosts?: Record<string, number>
  /** Legacy `aiModels.models` rows (admin overrides). */
  models?: AiModelConfig[]
  /** Multi-provider catalog (`models` option) — preferred pricing source. */
  modelsCatalog?: ModelsCatalogConfig
  /** Optional `aiModels.billing` overrides (merged over [mergeAiModelsBilling] defaults). */
  billing?: AIModelsBilling | null
}

/**
 * Result of a cost estimation.
 * `providerCostUsd`/`providerCostDzd` are pre-markup provider cost (0 when
 * unknown); `userCostDzd` is the retail amount the wallet would be debited.
 */
export interface AiCostEstimate {
  providerCostUsd: number
  providerCostDzd: number
  userCostDzd: number
  exchangeRate: number
  multiplier: number
  usedLocalCost: boolean
  breakdown: Record<string, number | boolean>
}

// --- Internal helpers (mirror backend one-to-one) --------------------------------

/** Named platform default for unknown text models — never `models[0]`. */
const DEFAULT_TEXT_PRICING_MODEL_ID = 'gemini-flash-lite-latest'
const DEFAULT_IMAGE_MODEL_ID = 'gemini-3.1-flash-image-preview'
const DEFAULT_TTS_MODEL_ID = 'gemini-2.5-pro-preview-tts'

/** Canonical id: trim, lowercase, strip the Gemini `models/` namespace. */
function canonicalModelId(id: string): string {
  return id
    .trim()
    .toLowerCase()
    .replace(/^models\//, '')
}

function stripNamespace(id: string): string {
  const trimmed = id.trim()
  const i = trimmed.indexOf('/')
  return i >= 0 ? trimmed.slice(i + 1) : trimmed
}

function catalogRowId(row: ModelCatalogRow): string {
  const r = row as ModelCatalogRow & { slug?: string }
  if (typeof r.id === 'string' && r.id.trim()) return r.id.trim()
  if (typeof r.slug === 'string' && r.slug.trim()) return r.slug.trim()
  return ''
}

type InternalConfig = Required<
  Pick<AiCalculatorConfig, 'exchangeRate' | 'defaultImageCost' | 'referenceImageCost'>
> & {
  resolutionCosts: Record<string, number>
  models: AiModelConfig[]
  modelsCatalog: ModelsCatalogConfig | undefined
  billing: ResolvedAiModelsBilling
}

/**
 * Deterministic client-side mirror of the backend `AiCalculator`.
 *
 * ```ts
 * const calc = new AiCalculator({ ...appConfig.aiModels, modelsCatalog: appConfig.models })
 * const { userCostDzd } = calc.estimateImageGeneration({ modelId, imageSize: '2K' })
 * ```
 */
export class AiCalculator {
  private config: InternalConfig

  constructor(config: AiCalculatorConfig = {}) {
    const exchangeRate = config.exchangeRate ?? FALLBACK_AI_EXCHANGE_RATE
    const billing = mergeAiModelsBilling(config.billing ?? null)
    const fallbackDzd = billing.imageGeneration.fallbackProviderCostPerImageUsd * exchangeRate
    this.config = {
      exchangeRate,
      defaultImageCost: config.defaultImageCost ?? fallbackDzd,
      referenceImageCost: config.referenceImageCost ?? 5,
      resolutionCosts: config.resolutionCosts ?? {
        MEDIA_RESOLUTION_LOW: 0,
        MEDIA_RESOLUTION_MEDIUM: 5,
        MEDIA_RESOLUTION_HIGH: 10,
      },
      models: config.models ?? [],
      modelsCatalog: config.modelsCatalog,
      billing,
    }
  }

  // -- lookup ---------------------------------------------------------------

  /** Exact-id legacy row (namespace tolerant). NO `models[0]` fallback. */
  private findLegacyModel(modelId: string): AiModelConfig | undefined {
    const id = modelId.trim()
    const bare = stripNamespace(id)
    return this.config.models.find((m) => m.id === id || m.id === bare)
  }

  private findCatalogRow(modelId: string): ModelCatalogRow | undefined {
    const rows = this.config.modelsCatalog?.data
    const id = modelId.trim()
    if (!id || !rows?.length) return undefined
    const canonical = canonicalModelId(id)
    return rows.find((r) => canonicalModelId(catalogRowId(r)) === canonical)
  }

  private modelHasVoiceCapability(model: AiModelConfig | undefined): boolean {
    const caps = model?.capabilities
    if (!Array.isArray(caps)) return false
    return caps.some((c) => c === 'voice' || c === 'audio')
  }

  // -- text pricing ----------------------------------------------------------

  /** Context-tier row from a legacy `tokens` pricing list (mirror backend). */
  private pickLegacyTokenRow(
    model: AiModelConfig,
    totalTokens: number
  ): { input: number; output: number } | null {
    const rows = (model.pricing ?? []).filter((p) => p.unit === 'tokens')
    if (!rows.length) return null
    const isLargeContext = totalTokens > 200_000
    const preferred =
      rows.find((p) =>
        isLargeContext
          ? String(p.contextThreshold ?? '').includes('>')
          : String(p.contextThreshold ?? '').includes('<=')
      ) ?? rows[0]
    const input = safeNumber(preferred.input)
    const output = safeNumber(preferred.output)
    if (input <= 0 && output <= 0) return null
    return { input, output }
  }

  /** Catalog `pricing.prompt`/`completion` (USD per token) → USD per 1M. */
  private pickCatalogTokenPricing(modelId: string): { input: number; output: number } | null {
    const row = this.findCatalogRow(modelId)
    const pricing = row?.pricing as { prompt?: unknown; completion?: unknown } | undefined
    if (!pricing || typeof pricing !== 'object') return null
    const promptPerToken = safeNumber(pricing.prompt)
    const completionPerToken = safeNumber(pricing.completion)
    if (promptPerToken <= 0 && completionPerToken <= 0) return null
    return { input: promptPerToken * 1_000_000, output: completionPerToken * 1_000_000 }
  }

  /**
   * USD-per-1M pricing: legacy exact-id → catalog → named default legacy row →
   * `null` (free). Mirrors backend `resolveTextTokenPricing`.
   */
  private resolveTextTokenPricing(
    modelId: string,
    totalTokens: number
  ): { input: number; output: number } | null {
    const legacy = this.findLegacyModel(modelId)
    if (legacy) {
      const row = this.pickLegacyTokenRow(legacy, totalTokens)
      if (row) return row
    }
    const catalog = this.pickCatalogTokenPricing(modelId)
    if (catalog) return catalog
    const fallback = this.findLegacyModel(DEFAULT_TEXT_PRICING_MODEL_ID)
    if (fallback) {
      const row = this.pickLegacyTokenRow(fallback, totalTokens)
      if (row) return row
    }
    return null
  }

  // -- image pricing ----------------------------------------------------------

  /**
   * Catalog per-image USD, preferring the per-tier map
   * (`image_output_per_size_usd`: requested tier → 1K → 2K → 4K → first
   * positive), then flat `image_output`.
   */
  private pickCatalogImageUsd(modelId: string, imageSize?: string): number | null {
    const row = this.findCatalogRow(modelId)
    const pricing = row?.pricing as
      | {
          image_output?: unknown
          imageOutput?: unknown
          image_output_per_size_usd?: unknown
          imageOutputPerSizeUsd?: unknown
        }
      | undefined
    if (!pricing || typeof pricing !== 'object') return null

    const perTier = (pricing.image_output_per_size_usd ?? pricing.imageOutputPerSizeUsd) as
      | Record<string, unknown>
      | undefined
    if (perTier && typeof perTier === 'object') {
      const ordered = imageSize ? [imageSize, '1K', '2K', '4K'] : ['1K', '2K', '4K']
      for (const key of ordered) {
        const v = safeNumber(perTier[key])
        if (v > 0) return v
      }
      for (const v of Object.values(perTier)) {
        const n = safeNumber(v)
        if (n > 0) return n
      }
    }

    const flat = safeNumber(pricing.image_output ?? pricing.imageOutput)
    return flat > 0 ? flat : null
  }

  /** Legacy exact-id `unit:'image'` row output (USD per image). */
  private pickLegacyImageUsd(modelId: string): number | null {
    const model = this.findLegacyModel(modelId)
    const row = (model?.pricing ?? []).find((p) => p.unit === 'image')
    const usd = safeNumber(row?.output)
    return usd > 0 ? usd : null
  }

  // -- shared retail add-ons ----------------------------------------------------

  /** Attachment surcharge (stores/products/audio context files) in retail DZD. */
  private attachmentExtraUserDzd(
    attachmentCount: number,
    attachmentResolution: 'low' | 'medium' | 'high'
  ): number {
    if (attachmentCount <= 0) return 0
    const { exchangeRate, billing } = this.config
    const ref = billing.referenceAttachmentSurcharge
    let usd = attachmentCount * ref.perFileUsd
    if (attachmentResolution === 'high') {
      usd += attachmentCount * ref.highResolutionExtraPerFileUsd
    } else if (attachmentResolution === 'low') {
      usd -= attachmentCount * ref.lowResolutionDiscountPerFileUsd
    }
    return roundMoney(usd * exchangeRate * billing.retailMarkup.multiplier)
  }

  /**
   * Flat DZD resolution extras — ONE rule, mirror of backend
   * `computeResolutionExtrasDzd`:
   *  - output extra only when an output size tier is requested (1K→LOW,
   *    2K→MEDIUM, 4K→HIGH),
   *  - input extra only when an explicit input resolution is requested
   *    (`max(0, cost[resolution] − cost[LOW])`).
   */
  private resolutionExtrasDzd(options: { imageSize?: string; resolution?: string }): {
    outputExtraDzd: number
    inputExtraDzd: number
    totalDzd: number
  } {
    const costs = this.config.resolutionCosts
    let outputExtraDzd = 0
    if (options.imageSize) {
      const key =
        options.imageSize === '4K'
          ? 'MEDIA_RESOLUTION_HIGH'
          : options.imageSize === '2K'
            ? 'MEDIA_RESOLUTION_MEDIUM'
            : 'MEDIA_RESOLUTION_LOW'
      outputExtraDzd = roundMoney(safeNumber(costs[key]))
    }

    let inputExtraDzd = 0
    if (options.resolution) {
      const low = safeNumber(costs.MEDIA_RESOLUTION_LOW)
      const tier = safeNumber(costs[options.resolution])
      inputExtraDzd = roundMoney(Math.max(0, tier - low))
    }

    return { outputExtraDzd, inputExtraDzd, totalDzd: roundMoney(outputExtraDzd + inputExtraDzd) }
  }

  // -- voice pricing ------------------------------------------------------------

  /** Voice row: exact id → named TTS default → any voice-capable row. */
  private findVoiceModel(modelId: string): AiModelConfig | undefined {
    return (
      this.findLegacyModel(modelId) ??
      this.findLegacyModel(DEFAULT_TTS_MODEL_ID) ??
      this.config.models.find((m) => this.modelHasVoiceCapability(m))
    )
  }

  /**
   * Flat provider USD per TTS generation: `audio`/`voice` units; for
   * voice-capable rows also the `image` unit (legacy admin editor artifact).
   */
  private pickTtsFlatUsd(model: AiModelConfig): number | null {
    const rows = model.pricing ?? []
    for (const unit of ['audio', 'voice'] as const) {
      const row = rows.find((p) => p.unit === unit)
      const usd = safeNumber(row?.output)
      if (usd > 0) return usd
    }
    if (this.modelHasVoiceCapability(model)) {
      const row = rows.find((p) => p.unit === 'image')
      const usd = safeNumber(row?.output)
      if (usd > 0) return usd
    }
    return null
  }

  /**
   * Base TTS pricing (mirror backend `computeBaseVoiceoverBilling`):
   * `localCost` → flat USD → tokens per-1M → floor; non-localCost paths are
   * floored by `voiceGeneration.minimumChargeUsd`. Provider cost is honest
   * (0 when only a retail figure is known).
   */
  private voiceoverBase(
    modelId: string,
    promptTokens: number,
    outputTokens: number
  ): { baseDzd: number; providerCostUsd: number; usedLocalCost: boolean } {
    const { exchangeRate, billing } = this.config
    const floorDzd = roundMoney(billing.voiceGeneration.minimumChargeUsd * exchangeRate)
    const model = this.findVoiceModel(modelId)

    if (model?.localCost !== undefined && model?.localCost !== null) {
      return {
        baseDzd: roundMoney(safeNumber(model.localCost)),
        providerCostUsd: 0,
        usedLocalCost: true,
      }
    }

    if (model) {
      const flatUsd = this.pickTtsFlatUsd(model)
      if (flatUsd !== null) {
        return {
          baseDzd: Math.max(
            floorDzd,
            roundMoney(flatUsd * exchangeRate * billing.retailMarkup.multiplier)
          ),
          providerCostUsd: flatUsd,
          usedLocalCost: false,
        }
      }
      const tokenRow = this.pickLegacyTokenRow(model, promptTokens + outputTokens)
      if (tokenRow) {
        const providerCostUsd =
          (promptTokens / 1_000_000) * tokenRow.input + (outputTokens / 1_000_000) * tokenRow.output
        return {
          baseDzd: Math.max(
            floorDzd,
            roundMoney(providerCostUsd * exchangeRate * billing.retailMarkup.multiplier)
          ),
          providerCostUsd,
          usedLocalCost: false,
        }
      }
    }

    return { baseDzd: floorDzd, providerCostUsd: 0, usedLocalCost: false }
  }

  private ttsTokenEstimates(
    scriptCharLength: number,
    attachmentCount: number
  ): { promptTokens: number; outputTokens: number } {
    const t = this.config.billing.voiceGeneration.ttsTokenEstimate
    let textTok = Math.round(scriptCharLength / 4)
    if (textTok <= 0) {
      textTok = attachmentCount > 0 ? t.whenAttachmentsOnlyTokens : t.whenScriptEmptyTokens
    }
    const promptTokens = Math.min(
      t.maxTotalTokens,
      Math.max(0, t.promptBaseTokens + textTok + attachmentCount * t.promptPerAttachmentTokens)
    )
    const outputTokens = Math.min(
      t.maxTotalTokens,
      Math.max(t.outputMinimumTokens, Math.round(textTok * t.outputToTextTokenRatio))
    )
    return { promptTokens, outputTokens }
  }

  // -- estimators -----------------------------------------------------------

  /**
   * Image generation cost (image studio, logo studio, landing-page image).
   *
   * `userCostDzd = base(model, tier) × iterations + referenceImages ×
   * referenceImageCost + attachment surcharge + resolution extras + feature
   * add-ons`. Base precedence: catalog → legacy `unit:'image'` row →
   * `defaultImageCost` floor; legacy `localCost` overrides retail.
   */
  estimateImageGeneration(
    options: {
      modelId?: string
      attachmentCount?: number
      attachmentResolution?: 'low' | 'medium' | 'high'
      /** Explicit input/reference processing resolution (input extra). */
      resolution?: string
      /**
       * Effective output size tier (`1K`/`2K`/`4K`). Pass only for models that
       * support output tiers — the backend resolves it via `pickImageSize`.
       */
      imageSize?: string
      iterations?: number
      referenceImageCount?: number
      /** Catalog-driven feature add-ons (DZD), e.g. transparent background. */
      featureAddonsDzd?: number
    } = {}
  ): AiCostEstimate {
    const {
      modelId = DEFAULT_IMAGE_MODEL_ID,
      attachmentCount = 0,
      attachmentResolution = 'medium',
      resolution,
      imageSize,
      iterations = 1,
      referenceImageCount = 0,
      featureAddonsDzd = 0,
    } = options

    const { exchangeRate, billing } = this.config
    const mult = billing.retailMarkup.multiplier

    // Provider USD per image: catalog → legacy row → defaultImageCost floor.
    const catalogUsd = this.pickCatalogImageUsd(modelId, imageSize)
    const legacyUsd = catalogUsd === null ? this.pickLegacyImageUsd(modelId) : null
    const providerCostUsdPerImage =
      catalogUsd ?? legacyUsd ?? this.config.defaultImageCost / exchangeRate
    const providerCostDzdPerImage = providerCostUsdPerImage * exchangeRate

    const localCost = this.findLegacyModel(modelId)?.localCost
    const usedLocalCost = localCost !== undefined && localCost !== null
    const basePerIteration = usedLocalCost
      ? roundMoney(safeNumber(localCost))
      : roundMoney(providerCostDzdPerImage * mult)

    const iter = Math.max(1, Math.floor(iterations))
    const baseCostDzd = roundMoney(basePerIteration * iter)

    const refExtraDzd = roundMoney(
      Math.max(0, referenceImageCount) * this.config.referenceImageCost
    )
    const attachExtraDzd = this.attachmentExtraUserDzd(
      Math.max(0, attachmentCount),
      attachmentResolution
    )
    const resExtras = this.resolutionExtrasDzd({ imageSize, resolution })
    const addonsDzd = roundMoney(Math.max(0, safeNumber(featureAddonsDzd)))

    const userCostDzd = roundMoney(
      baseCostDzd + refExtraDzd + attachExtraDzd + resExtras.totalDzd + addonsDzd
    )

    return {
      providerCostUsd: providerCostUsdPerImage * iter,
      providerCostDzd: providerCostDzdPerImage * iter,
      userCostDzd,
      exchangeRate,
      multiplier: mult,
      usedLocalCost,
      breakdown: {
        baseCostDzd,
        referenceImageExtraDzd: refExtraDzd,
        attachmentExtraDzd: attachExtraDzd,
        outputResolutionExtraDzd: resExtras.outputExtraDzd,
        inputResolutionExtraDzd: resExtras.inputExtraDzd,
        resolutionExtraDzd: resExtras.totalDzd,
        featureAddonsDzd: addonsDzd,
        iterations: iter,
        referenceImageCount,
        attachmentCount,
      },
    }
  }

  /**
   * Text generation estimate (actual billing happens post-success from real
   * token usage on the backend). Free when the model is unpriced everywhere
   * or `promptTokens < freeTierMaxPromptTokens` (prompt tokens — not total).
   */
  estimateTextGeneration(
    options: {
      modelId?: string
      estimatedPromptTokens?: number
      estimatedOutputTokens?: number
    } = {}
  ): AiCostEstimate {
    const tg = this.config.billing.textGeneration
    const mult = this.config.billing.retailMarkup.multiplier
    const {
      modelId = DEFAULT_TEXT_PRICING_MODEL_ID,
      estimatedPromptTokens = tg.estimatedPromptTokensDefault,
      estimatedOutputTokens = tg.estimatedOutputTokensDefault,
    } = options

    const promptTokens = Math.max(0, estimatedPromptTokens)
    const outputTokens = Math.max(0, estimatedOutputTokens)
    const { exchangeRate } = this.config

    const pricing = this.resolveTextTokenPricing(modelId, promptTokens + outputTokens)
    if (!pricing || promptTokens < tg.freeTierMaxPromptTokens) {
      return {
        providerCostUsd: 0,
        providerCostDzd: 0,
        userCostDzd: 0,
        exchangeRate,
        multiplier: mult,
        usedLocalCost: false,
        breakdown: {
          estimatedPromptTokens: promptTokens,
          estimatedOutputTokens: outputTokens,
          isFree: 1,
        },
      }
    }

    const providerCostUsd =
      (promptTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
    const providerCostDzd = providerCostUsd * exchangeRate
    const userCostDzd = roundMoney(providerCostDzd * mult)

    return {
      providerCostUsd,
      providerCostDzd,
      userCostDzd,
      exchangeRate,
      multiplier: mult,
      usedLocalCost: false,
      breakdown: {
        estimatedPromptTokens: promptTokens,
        estimatedOutputTokens: outputTokens,
        isFree: 0,
      },
    }
  }

  /**
   * Voiceover estimate: TTS base (heuristic tokens unless explicitly given) +
   * attachment surcharge + optional script-enhancement add-on. The backend
   * settles from ACTUAL usage (`computeVoiceoverSettlement`); this preview
   * uses the same retail policy.
   */
  estimateVoiceover(
    options: {
      modelId?: string
      attachmentCount?: number
      attachmentResolution?: 'low' | 'medium' | 'high'
      enhanceScript?: boolean
      scriptCharLength?: number
      estimatedPromptTokens?: number
      estimatedOutputTokens?: number
    } = {}
  ): AiCostEstimate {
    const modelId = options.modelId ?? DEFAULT_TTS_MODEL_ID
    const attachmentCount = Math.max(0, options.attachmentCount ?? 0)
    const attachmentResolution = options.attachmentResolution ?? 'medium'
    const enhanceScript = options.enhanceScript !== false

    const hasExplicitTokens =
      options.estimatedPromptTokens !== undefined &&
      options.estimatedPromptTokens !== null &&
      options.estimatedOutputTokens !== undefined &&
      options.estimatedOutputTokens !== null
    const tokenEst = hasExplicitTokens
      ? {
          promptTokens: Math.max(0, options.estimatedPromptTokens!),
          outputTokens: Math.max(0, options.estimatedOutputTokens!),
        }
      : this.ttsTokenEstimates(Math.max(0, options.scriptCharLength ?? 0), attachmentCount)

    const { exchangeRate, billing } = this.config
    const base = this.voiceoverBase(modelId, tokenEst.promptTokens, tokenEst.outputTokens)
    const attachExtra = this.attachmentExtraUserDzd(attachmentCount, attachmentResolution)
    const enhanceExtra = enhanceScript
      ? roundMoney(billing.voiceGeneration.scriptEnhancementAddonUsd * exchangeRate)
      : 0
    const userCostDzd = roundMoney(base.baseDzd + attachExtra + enhanceExtra)

    return {
      providerCostUsd: base.providerCostUsd,
      providerCostDzd: base.providerCostUsd * exchangeRate,
      userCostDzd,
      exchangeRate,
      multiplier: billing.retailMarkup.multiplier,
      usedLocalCost: base.usedLocalCost,
      breakdown: {
        ttsBaseDzd: base.baseDzd,
        attachmentExtraDzd: attachExtra,
        enhanceAddonDzd: enhanceExtra,
        attachmentCount,
        estimatedPromptTokens: tokenEst.promptTokens,
        estimatedOutputTokens: tokenEst.outputTokens,
      },
    }
  }

  /**
   * Landing-page image cost — identical formula to [estimateImageGeneration]
   * (image-studio parity). Without an image model id, returns the fixed
   * `billing.landingPageImage` charge (provider cost unknown → 0). A ≤ 0
   * image quote also falls back to the fixed charge (zero-guard).
   */
  estimateImageLandingPage(
    options: {
      imageModelId?: string
      attachmentCount?: number
      attachmentResolution?: 'low' | 'medium' | 'high'
      resolution?: string
      imageSize?: string
      referenceImageCount?: number
      featureAddonsDzd?: number
    } = {}
  ): AiCostEstimate {
    const { exchangeRate, billing } = this.config
    const imageModelId = options.imageModelId?.trim()

    if (!imageModelId) {
      const fixedDzd = roundMoney(billing.landingPageImage.fixedChargeUsd * exchangeRate)
      return {
        providerCostUsd: 0,
        providerCostDzd: 0,
        userCostDzd: fixedDzd,
        exchangeRate,
        multiplier: billing.retailMarkup.multiplier,
        usedLocalCost: false,
        breakdown: { fixedCostDzd: fixedDzd },
      }
    }

    const img = this.estimateImageGeneration({
      modelId: imageModelId,
      attachmentCount: options.attachmentCount,
      attachmentResolution: options.attachmentResolution,
      resolution: options.resolution,
      imageSize: options.imageSize,
      referenceImageCount: options.referenceImageCount,
      featureAddonsDzd: options.featureAddonsDzd,
    })
    if (img.userCostDzd > 0) return img

    const fixedDzd = roundMoney(billing.landingPageImage.fixedChargeUsd * exchangeRate)
    return {
      ...img,
      userCostDzd: fixedDzd,
      breakdown: { ...img.breakdown, fixedCostDzd: fixedDzd },
    }
  }
}

/** Heuristic TTS token counts using **default** billing only (keep in sync with backend). */
export function defaultVoiceTtsTokenEstimates(
  scriptCharLength: number,
  attachmentCount: number
): { promptTokens: number; outputTokens: number } {
  const t = mergeAiModelsBilling(null).voiceGeneration.ttsTokenEstimate
  let textTok = Math.round(scriptCharLength / 4)
  if (textTok <= 0) {
    textTok = attachmentCount > 0 ? t.whenAttachmentsOnlyTokens : t.whenScriptEmptyTokens
  }
  const promptTokens = Math.min(
    t.maxTotalTokens,
    Math.max(0, t.promptBaseTokens + textTok + attachmentCount * t.promptPerAttachmentTokens)
  )
  const outputTokens = Math.min(
    t.maxTotalTokens,
    Math.max(t.outputMinimumTokens, Math.round(textTok * t.outputToTextTokenRatio))
  )
  return { promptTokens, outputTokens }
}
