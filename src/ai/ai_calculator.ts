/**
 * Pure utility class for estimating AI generation costs client-side.
 *
 * Mirrors the backend `AiCalculator` in `backend/app/services/ai_calculator.ts`.
 * All methods are deterministic and require no network calls.
 * The backend quote is authoritative; this calculator is a deterministic
 * mirror for UX (showing estimated cost before the user clicks generate).
 *
 * Canonical `aiModels.billing` keys — keep in sync: backend `configs_controller.ts`,
 * feeef `lib/core/app_config.dart`, admins_dashboard `src/lib/hooks/useOptions.ts`.
 */

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

function roundMoney(amount: number, precision = 3): number {
  const factor = 10 ** precision
  return Math.round((amount + Number.EPSILON) * factor) / factor
}

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

export interface AiModelPricing {
  input?: number
  output?: number
  unit: string
  contextThreshold?: string
}

/**
 * Optional operator overrides for Gemini image-generation Google Search grounding.
 * Shapes `aiModels.models[].tools` from the app config API — same as backend `AIModel.tools`.
 * Undefined keys mean “use platform default for this model id” (see backend `gemini_image_grounding`).
 */
export interface AiModelTools {
  googleSearch?: boolean
  googleImageSearch?: boolean
}

export interface AiModelConfig {
  id: string
  pricing?: AiModelPricing[]
  localCost?: number | null
  /** From aiModels — used so TTS billing does not fall back to the first (often image) row. */
  capabilities?: string[]
  tools?: AiModelTools
}

export interface AiCalculatorConfig {
  exchangeRate?: number
  defaultImageCost?: number
  referenceImageCost?: number
  resolutionCosts?: Record<string, number>
  models?: AiModelConfig[]
  /** Optional `aiModels.billing` overrides (merged over [mergeAiModelsBilling] defaults). */
  billing?: AIModelsBilling | null
}

export interface AiCostEstimate {
  providerCostUsd: number
  providerCostDzd: number
  userCostDzd: number
  exchangeRate: number
  multiplier: number
  usedLocalCost: boolean
  breakdown: Record<string, number | boolean>
}

function findModel(
  models: AiModelConfig[],
  modelId: string,
  fallbackId: string
): AiModelConfig | undefined {
  return (
    models.find((m) => m.id === modelId) || models.find((m) => m.id === fallbackId) || models[0]
  )
}

function modelHasVoiceCapability(model: AiModelConfig | undefined): boolean {
  const caps = model?.capabilities
  if (!Array.isArray(caps)) return false
  return caps.some((c) => c === 'voice' || c === 'audio')
}

/** TTS billing: no `models[0]` fallback (avoids using image model pricing for every voice). */
function findVoiceModel(
  models: AiModelConfig[],
  modelId: string,
  fallbackId: string
): AiModelConfig | undefined {
  return (
    models.find((m) => m.id === modelId) ||
    models.find((m) => m.id === fallbackId) ||
    models.find((m) => modelHasVoiceCapability(m))
  )
}

function pickTtsProviderOutputUsd(model: AiModelConfig | undefined): number | null {
  if (!model?.pricing?.length) return null
  const voiceLike = modelHasVoiceCapability(model)
  for (const unit of ['audio', 'voice'] as const) {
    const row = model.pricing.find((p) => p.unit === unit)
    // eslint-disable-next-line eqeqeq
    if (row?.output == null) continue
    const usd = row.output
    if (usd > 0) return usd
  }
  if (voiceLike) {
    const row = model.pricing.find((p) => p.unit === 'image')
    // eslint-disable-next-line eqeqeq
    if (row?.output == null) return null
    const usd = row.output
    if (usd > 0) return usd
  }
  return null
}

function ttsTokenEstimatesFromResolved(
  b: ResolvedAiModelsBilling,
  scriptCharLength: number,
  attachmentCount: number
): { promptTokens: number; outputTokens: number } {
  const t = b.voiceGeneration.ttsTokenEstimate
  let textTok = Math.round(scriptCharLength / 4)
  if (textTok <= 0) {
    textTok = attachmentCount > 0 ? t.whenAttachmentsOnlyTokens : t.whenScriptEmptyTokens
  }
  const rawPrompt = t.promptBaseTokens + textTok + attachmentCount * t.promptPerAttachmentTokens
  const promptTokens = Math.min(t.maxTotalTokens, Math.max(0, rawPrompt))
  const rawOutput = Math.max(t.outputMinimumTokens, Math.round(textTok * t.outputToTextTokenRatio))
  const outputTokens = Math.min(t.maxTotalTokens, rawOutput)
  return { promptTokens, outputTokens }
}

/** Keep in sync with backend `defaultVoiceTtsTokenEstimates` (default billing only). */
export function defaultVoiceTtsTokenEstimates(
  scriptCharLength: number,
  attachmentCount: number
): { promptTokens: number; outputTokens: number } {
  return ttsTokenEstimatesFromResolved(
    mergeAiModelsBilling(null),
    scriptCharLength,
    attachmentCount
  )
}

function pickVoiceTokenPricing(
  model: AiModelConfig | undefined,
  totalTokens: number
): { input: number; output: number } | null {
  const tokenPricings = (model?.pricing ?? []).filter((p) => p.unit === 'tokens')
  if (!tokenPricings.length) return null
  const isLargeContext = totalTokens > 200_000
  const preferred =
    tokenPricings.find((p) =>
      isLargeContext
        ? String(p.contextThreshold ?? '').includes('>')
        : String(p.contextThreshold ?? '').includes('<=')
    ) || tokenPricings[0]
  const input = preferred.input ?? 0
  const output = preferred.output ?? 0
  if (input <= 0 && output <= 0) return null
  return { input, output }
}

type InternalConfig = Required<
  Pick<AiCalculatorConfig, 'exchangeRate' | 'defaultImageCost' | 'referenceImageCost'>
> & {
  resolutionCosts: Record<string, number>
  models: AiModelConfig[]
  billing: ResolvedAiModelsBilling
}

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
      billing,
    }
  }

  /** TTS base DZD: localCost → flat USD row → tokens (per 1M) × estimates × rate × multiplier → floor. */
  private _voiceoverBaseUserCostDzd(
    modelId: string,
    promptTokens: number,
    outputTokens: number
  ): { baseDzd: number; usedLocalCost: boolean } {
    const { exchangeRate, billing, models } = this.config
    const b = billing
    const floorDzd = roundMoney(b.voiceGeneration.minimumChargeUsd * exchangeRate)
    const model = findVoiceModel(models, modelId, 'gemini-2.5-pro-preview-tts')
    if (model?.localCost !== undefined && model.localCost !== null) {
      return { baseDzd: roundMoney(model.localCost), usedLocalCost: true }
    }
    const providerUsd = pickTtsProviderOutputUsd(model)
    // eslint-disable-next-line eqeqeq
    if (providerUsd != null) {
      const providerDzd = providerUsd * exchangeRate
      return {
        baseDzd: roundMoney(providerDzd * b.retailMarkup.multiplier),
        usedLocalCost: false,
      }
    }
    const tokenPricing = pickVoiceTokenPricing(model, promptTokens + outputTokens)
    if (tokenPricing) {
      const providerCostUsd =
        (promptTokens / 1_000_000) * tokenPricing.input +
        (outputTokens / 1_000_000) * tokenPricing.output
      const providerDzd = providerCostUsd * exchangeRate
      return {
        baseDzd: roundMoney(providerDzd * b.retailMarkup.multiplier),
        usedLocalCost: false,
      }
    }
    return { baseDzd: floorDzd, usedLocalCost: false }
  }

  private _attachmentExtraUserDzd(
    attachmentCount: number,
    attachmentResolution: 'low' | 'medium' | 'high'
  ): number {
    if (attachmentCount <= 0) return 0
    const { exchangeRate, billing } = this.config
    const ref = billing.referenceAttachmentSurcharge
    const m = billing.retailMarkup.multiplier
    let attachCostUsd = attachmentCount * ref.perFileUsd
    if (attachmentResolution === 'high') {
      attachCostUsd += attachmentCount * ref.highResolutionExtraPerFileUsd
    } else if (attachmentResolution === 'low') {
      attachCostUsd -= attachmentCount * ref.lowResolutionDiscountPerFileUsd
    }
    return roundMoney(attachCostUsd * exchangeRate * m)
  }

  /**
   * Estimate the cost of an image generation action.
   * Covers: image gen, logo gen, editOrGenerateSimpleImage.
   */
  estimateImageGeneration(
    options: {
      modelId?: string
      attachmentCount?: number
      attachmentResolution?: 'low' | 'medium' | 'high'
      resolution?: string
      imageSize?: string
      iterations?: number
      referenceImageCount?: number
    } = {}
  ): AiCostEstimate {
    const {
      modelId = 'gemini-3.1-flash-image-preview',
      attachmentCount = 0,
      attachmentResolution = 'medium',
      resolution,
      imageSize,
      iterations = 1,
      referenceImageCount = 0,
    } = options

    const model = findModel(this.config.models, modelId, 'gemini-3.1-flash-image-preview')
    const { exchangeRate, defaultImageCost, billing } = this.config
    const mult = billing.retailMarkup.multiplier

    const localCost = model?.localCost
    const imagePricing = model?.pricing?.find((p) => p.unit === 'image')

    const providerCostUsd = imagePricing?.output
      ? imagePricing.output
      : defaultImageCost / exchangeRate
    const providerCostDzd = imagePricing?.output ? providerCostUsd * exchangeRate : defaultImageCost

    const computedUserCostDzd = providerCostDzd * mult
    const usedLocalCost = localCost !== undefined && localCost !== null
    const basePerIteration = usedLocalCost ? localCost! : roundMoney(computedUserCostDzd)
    const baseCostDzd = roundMoney(basePerIteration * iterations)

    const refExtraDzd = roundMoney(referenceImageCount * this.config.referenceImageCost)

    const attachExtraDzd = this._attachmentExtraUserDzd(attachmentCount, attachmentResolution)

    const supportsImageSize = modelId === 'gemini-3.1-flash-image-preview'
    let outputResKey = 'MEDIA_RESOLUTION_HIGH'
    if (supportsImageSize && imageSize) {
      outputResKey =
        imageSize === '4K'
          ? 'MEDIA_RESOLUTION_HIGH'
          : imageSize === '2K'
            ? 'MEDIA_RESOLUTION_MEDIUM'
            : 'MEDIA_RESOLUTION_LOW'
    } else if (resolution) {
      outputResKey = resolution
    }
    const outputResExtraDzd = supportsImageSize
      ? roundMoney(this.config.resolutionCosts[outputResKey] ?? 0)
      : 0

    let referenceResolutionExtraDzd = 0
    if (referenceImageCount > 0 && resolution) {
      const low = this.config.resolutionCosts.MEDIA_RESOLUTION_LOW ?? 0
      const tier = this.config.resolutionCosts[resolution] ?? 0
      referenceResolutionExtraDzd = roundMoney(Math.max(0, tier - low))
    }

    const resExtraDzd = roundMoney(outputResExtraDzd + referenceResolutionExtraDzd)

    const userCostDzd = roundMoney(baseCostDzd + refExtraDzd + attachExtraDzd + resExtraDzd)

    return {
      providerCostUsd: providerCostUsd * iterations,
      providerCostDzd: providerCostDzd * iterations,
      userCostDzd,
      exchangeRate,
      multiplier: mult,
      usedLocalCost,
      breakdown: {
        baseCostDzd,
        referenceImageExtraDzd: refExtraDzd,
        attachmentExtraDzd: attachExtraDzd,
        outputResolutionExtraDzd: outputResExtraDzd,
        referenceResolutionExtraDzd,
        resolutionExtraDzd: resExtraDzd,
        iterations,
        referenceImageCount,
        attachmentCount,
      },
    }
  }

  /**
   * Estimate the cost of a text generation action.
   * Covers: updateProductUsingAi, generateSimpleCode, generateCustomComponentCode.
   * Uses estimated tokens (exact cost billed post-generation).
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
      modelId = 'gemini-3-flash-preview',
      estimatedPromptTokens = tg.estimatedPromptTokensDefault,
      estimatedOutputTokens = tg.estimatedOutputTokensDefault,
    } = options

    const totalTokens = estimatedPromptTokens + estimatedOutputTokens
    const { exchangeRate } = this.config
    const model = findModel(this.config.models, modelId, 'gemini-3-flash-preview')
    const tokenPricing = model?.pricing?.find((p) => p.unit === 'tokens')

    if (!tokenPricing || totalTokens < tg.freeTierMaxPromptTokens) {
      return {
        providerCostUsd: 0,
        providerCostDzd: 0,
        userCostDzd: 0,
        exchangeRate,
        multiplier: mult,
        usedLocalCost: false,
        breakdown: {
          estimatedPromptTokens,
          estimatedOutputTokens,
          isFree: true,
        },
      }
    }

    const inputPrice = tokenPricing.input ?? 0
    const outputPrice = tokenPricing.output ?? 0
    const providerCostUsd =
      (estimatedPromptTokens / 1_000_000) * inputPrice +
      (estimatedOutputTokens / 1_000_000) * outputPrice
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
        estimatedPromptTokens,
        estimatedOutputTokens,
        isFree: false,
      },
    }
  }

  /**
   * Voiceover: base + attachment surcharge + optional script-enhancement add-on.
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
    const modelId = options.modelId ?? 'gemini-2.5-pro-preview-tts'
    const attachmentCount = options.attachmentCount ?? 0
    const attachmentResolution = options.attachmentResolution ?? 'medium'
    const enhanceScript = options.enhanceScript !== false
    const charLen = options.scriptCharLength ?? 0

    const b = this.config.billing
    const cap = b.voiceGeneration.ttsTokenEstimate.maxTotalTokens
    const tokenEst =
      // eslint-disable-next-line eqeqeq
      options.estimatedPromptTokens != null && options.estimatedOutputTokens != null
        ? {
            promptTokens: Math.max(0, Math.min(cap, options.estimatedPromptTokens)),
            outputTokens: Math.max(0, Math.min(cap, options.estimatedOutputTokens)),
          }
        : ttsTokenEstimatesFromResolved(b, charLen, attachmentCount)

    const { exchangeRate } = this.config
    const { baseDzd, usedLocalCost } = this._voiceoverBaseUserCostDzd(
      modelId,
      tokenEst.promptTokens,
      tokenEst.outputTokens
    )
    const attachExtra = this._attachmentExtraUserDzd(attachmentCount, attachmentResolution)
    const enhanceExtra = enhanceScript
      ? roundMoney(b.voiceGeneration.scriptEnhancementAddonUsd * exchangeRate)
      : 0
    const userCostDzd = roundMoney(baseDzd + attachExtra + enhanceExtra)

    return {
      providerCostUsd: userCostDzd / exchangeRate,
      providerCostDzd: userCostDzd,
      userCostDzd,
      exchangeRate,
      multiplier: 1,
      usedLocalCost,
      breakdown: {
        fixedCostDzd: baseDzd,
        attachmentExtraDzd: attachExtra,
        enhanceAddonDzd: enhanceExtra,
        attachmentCount,
        estimatedPromptTokens: tokenEst.promptTokens,
        estimatedOutputTokens: tokenEst.outputTokens,
      },
    }
  }

  /** Get the fixed cost for image landing page generation. */
  estimateImageLandingPage(): AiCostEstimate {
    const { exchangeRate, billing } = this.config
    const costDzd = roundMoney(billing.landingPageImage.fixedChargeUsd * exchangeRate)
    return {
      providerCostUsd: costDzd / exchangeRate,
      providerCostDzd: costDzd,
      userCostDzd: costDzd,
      exchangeRate,
      multiplier: 1,
      usedLocalCost: false,
      breakdown: { fixedCostDzd: costDzd },
    }
  }
}
