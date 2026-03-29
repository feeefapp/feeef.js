/**
 * Pure utility class for estimating AI generation costs client-side.
 *
 * Mirrors the backend `AiCalculator` in `backend/app/services/ai_calculator.ts`.
 * All methods are deterministic and require no network calls.
 * The backend quote is authoritative; this calculator is a deterministic
 * mirror for UX (showing estimated cost before the user clicks generate).
 */

export const AI_BILLING = {
  MULTIPLIER: 2.5,
  FREE_TEXT_TOKENS_THRESHOLD: 1000,
  DEFAULT_EXCHANGE_RATE: 260,
  DEFAULT_GOOGLE_IMAGE_COST_USD: 0.131,
  DEFAULT_ATTACHMENT_COST_USD: 0.1,
  ATTACHMENT_HIGH_RES_EXTRA_USD: 0.05,
  ATTACHMENT_LOW_RES_DISCOUNT_USD: 0.05,
  VOICEOVER_FIXED_COST_DZD: 50,
  VOICEOVER_ENHANCE_ADDON_DZD: 25,
  IMAGE_LANDING_PAGE_FIXED_COST_DZD: 100,
  DEFAULT_TEXT_PROMPT_TOKENS: 2000,
  DEFAULT_TEXT_OUTPUT_TOKENS: 1000,
  VOICE_TTS_EMPTY_SCRIPT_TEXT_TOKENS: 200,
  VOICE_TTS_ATTACHMENT_ONLY_TEXT_TOKENS: 400,
  VOICE_TTS_PROMPT_BASE: 400,
  VOICE_TTS_PROMPT_PER_ATTACHMENT: 300,
  VOICE_TTS_OUTPUT_MIN: 300,
  VOICE_TTS_OUTPUT_TEXT_FACTOR: 2.5,
  VOICE_TTS_TOKEN_CAP: 32_000,
} as const

export interface AiModelPricing {
  input?: number
  output?: number
  unit: string
  contextThreshold?: string
}

export interface AiModelConfig {
  id: string
  pricing?: AiModelPricing[]
  localCost?: number | null
  /** From aiModels — used so TTS billing does not fall back to the first (often image) row. */
  capabilities?: string[]
}

export interface AiCalculatorConfig {
  exchangeRate?: number
  defaultImageCost?: number
  referenceImageCost?: number
  resolutionCosts?: Record<string, number>
  models?: AiModelConfig[]
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

function roundMoney(amount: number, precision = 3): number {
  const factor = 10 ** precision
  return Math.round(amount * factor) / factor
}

function findModel(
  models: AiModelConfig[],
  modelId: string,
  fallbackId: string,
): AiModelConfig | undefined {
  return (
    models.find((m) => m.id === modelId) ||
    models.find((m) => m.id === fallbackId) ||
    models[0]
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
  fallbackId: string,
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
    if (row?.output == null) continue
    const usd = row.output
    if (usd > 0) return usd
  }
  if (voiceLike) {
    const row = model.pricing.find((p) => p.unit === 'image')
    if (row?.output == null) return null
    const usd = row.output
    if (usd > 0) return usd
  }
  return null
}

/** Keep in sync with backend `defaultVoiceTtsTokenEstimates`. */
export function defaultVoiceTtsTokenEstimates(
  scriptCharLength: number,
  attachmentCount: number,
): { promptTokens: number; outputTokens: number } {
  let textTok = Math.round(scriptCharLength / 4)
  if (textTok <= 0) {
    textTok =
      attachmentCount > 0
        ? AI_BILLING.VOICE_TTS_ATTACHMENT_ONLY_TEXT_TOKENS
        : AI_BILLING.VOICE_TTS_EMPTY_SCRIPT_TEXT_TOKENS
  }
  const rawPrompt =
    AI_BILLING.VOICE_TTS_PROMPT_BASE +
    textTok +
    attachmentCount * AI_BILLING.VOICE_TTS_PROMPT_PER_ATTACHMENT
  const promptTokens = Math.min(AI_BILLING.VOICE_TTS_TOKEN_CAP, Math.max(0, rawPrompt))
  const rawOutput = Math.max(
    AI_BILLING.VOICE_TTS_OUTPUT_MIN,
    Math.round(textTok * AI_BILLING.VOICE_TTS_OUTPUT_TEXT_FACTOR),
  )
  const outputTokens = Math.min(AI_BILLING.VOICE_TTS_TOKEN_CAP, rawOutput)
  return { promptTokens, outputTokens }
}

function pickVoiceTokenPricing(
  model: AiModelConfig | undefined,
  totalTokens: number,
): { input: number; output: number } | null {
  const tokenPricings = (model?.pricing ?? []).filter((p) => p.unit === 'tokens')
  if (!tokenPricings.length) return null
  const isLargeContext = totalTokens > 200_000
  const preferred =
    tokenPricings.find((p) =>
      isLargeContext
        ? String(p.contextThreshold ?? '').includes('>')
        : String(p.contextThreshold ?? '').includes('<='),
    ) || tokenPricings[0]
  const input = preferred.input ?? 0
  const output = preferred.output ?? 0
  if (input <= 0 && output <= 0) return null
  return { input, output }
}

export class AiCalculator {
  private config: Required<
    Pick<AiCalculatorConfig, 'exchangeRate' | 'defaultImageCost' | 'referenceImageCost'>
  > & { resolutionCosts: Record<string, number>; models: AiModelConfig[] }

  constructor(config: AiCalculatorConfig = {}) {
    this.config = {
      exchangeRate: config.exchangeRate ?? AI_BILLING.DEFAULT_EXCHANGE_RATE,
      defaultImageCost:
        config.defaultImageCost ??
        AI_BILLING.DEFAULT_GOOGLE_IMAGE_COST_USD * (config.exchangeRate ?? AI_BILLING.DEFAULT_EXCHANGE_RATE),
      referenceImageCost: config.referenceImageCost ?? 5,
      resolutionCosts: config.resolutionCosts ?? {
        MEDIA_RESOLUTION_LOW: 0,
        MEDIA_RESOLUTION_MEDIUM: 5,
        MEDIA_RESOLUTION_HIGH: 10,
      },
      models: config.models ?? [],
    }
  }

  /** TTS base DZD: localCost → flat USD row → tokens (per 1M) × estimates × rate × MULTIPLIER → fixed. */
  private _voiceoverBaseUserCostDzd(
    modelId: string,
    promptTokens: number,
    outputTokens: number,
  ): { baseDzd: number; usedLocalCost: boolean } {
    const model = findVoiceModel(this.config.models, modelId, 'gemini-2.5-pro-preview-tts')
    if (model?.localCost !== undefined && model.localCost !== null) {
      return { baseDzd: roundMoney(model.localCost), usedLocalCost: true }
    }
    const providerUsd = pickTtsProviderOutputUsd(model)
    if (providerUsd != null) {
      const providerDzd = providerUsd * this.config.exchangeRate
      return {
        baseDzd: roundMoney(providerDzd * AI_BILLING.MULTIPLIER),
        usedLocalCost: false,
      }
    }
    const tokenPricing = pickVoiceTokenPricing(model, promptTokens + outputTokens)
    if (tokenPricing) {
      const providerCostUsd =
        (promptTokens / 1_000_000) * tokenPricing.input +
        (outputTokens / 1_000_000) * tokenPricing.output
      const providerDzd = providerCostUsd * this.config.exchangeRate
      return {
        baseDzd: roundMoney(providerDzd * AI_BILLING.MULTIPLIER),
        usedLocalCost: false,
      }
    }
    return { baseDzd: AI_BILLING.VOICEOVER_FIXED_COST_DZD, usedLocalCost: false }
  }

  private _attachmentExtraUserDzd(
    attachmentCount: number,
    attachmentResolution: 'low' | 'medium' | 'high',
  ): number {
    if (attachmentCount <= 0) return 0
    const { exchangeRate } = this.config
    let attachCostUsd = attachmentCount * AI_BILLING.DEFAULT_ATTACHMENT_COST_USD
    if (attachmentResolution === 'high') {
      attachCostUsd += attachmentCount * AI_BILLING.ATTACHMENT_HIGH_RES_EXTRA_USD
    } else if (attachmentResolution === 'low') {
      attachCostUsd -= attachmentCount * AI_BILLING.ATTACHMENT_LOW_RES_DISCOUNT_USD
    }
    return roundMoney(attachCostUsd * exchangeRate * AI_BILLING.MULTIPLIER)
  }

  /**
   * Estimate the cost of an image generation action.
   * Covers: image gen, logo gen, editOrGenerateSimpleImage.
   */
  estimateImageGeneration(options: {
    modelId?: string
    attachmentCount?: number
    attachmentResolution?: 'low' | 'medium' | 'high'
    resolution?: string
    imageSize?: string
    iterations?: number
    referenceImageCount?: number
  } = {}): AiCostEstimate {
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
    const { exchangeRate, defaultImageCost } = this.config

    const localCost = model?.localCost
    const imagePricing = model?.pricing?.find((p) => p.unit === 'image')

    const providerCostUsd = imagePricing?.output
      ? imagePricing.output
      : defaultImageCost / exchangeRate
    const providerCostDzd = imagePricing?.output
      ? providerCostUsd * exchangeRate
      : defaultImageCost

    const computedUserCostDzd = providerCostDzd * AI_BILLING.MULTIPLIER
    const usedLocalCost = localCost !== undefined && localCost !== null
    const basePerIteration = usedLocalCost ? localCost! : roundMoney(computedUserCostDzd)
    const baseCostDzd = roundMoney(basePerIteration * iterations)

    // Reference image extra cost
    const refExtraDzd = roundMoney(referenceImageCount * this.config.referenceImageCost)

    const attachExtraDzd = this._attachmentExtraUserDzd(attachmentCount, attachmentResolution)

    // Resolution extra: output size + reference-input tier (when refs exist)
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
      multiplier: AI_BILLING.MULTIPLIER,
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
  estimateTextGeneration(options: {
    modelId?: string
    estimatedPromptTokens?: number
    estimatedOutputTokens?: number
  } = {}): AiCostEstimate {
    const {
      modelId = 'gemini-3-flash-preview',
      estimatedPromptTokens = AI_BILLING.DEFAULT_TEXT_PROMPT_TOKENS,
      estimatedOutputTokens = AI_BILLING.DEFAULT_TEXT_OUTPUT_TOKENS,
    } = options

    const totalTokens = estimatedPromptTokens + estimatedOutputTokens
    const { exchangeRate } = this.config
    const model = findModel(this.config.models, modelId, 'gemini-3-flash-preview')
    const tokenPricing = model?.pricing?.find((p) => p.unit === 'tokens')

    if (!tokenPricing || totalTokens < AI_BILLING.FREE_TEXT_TOKENS_THRESHOLD) {
      return {
        providerCostUsd: 0,
        providerCostDzd: 0,
        userCostDzd: 0,
        exchangeRate,
        multiplier: AI_BILLING.MULTIPLIER,
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
    const userCostDzd = roundMoney(providerCostDzd * AI_BILLING.MULTIPLIER)

    return {
      providerCostUsd,
      providerCostDzd,
      userCostDzd,
      exchangeRate,
      multiplier: AI_BILLING.MULTIPLIER,
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
  estimateVoiceover(options: {
    modelId?: string
    attachmentCount?: number
    attachmentResolution?: 'low' | 'medium' | 'high'
    enhanceScript?: boolean
    scriptCharLength?: number
    estimatedPromptTokens?: number
    estimatedOutputTokens?: number
  } = {}): AiCostEstimate {
    const modelId = options.modelId ?? 'gemini-2.5-pro-preview-tts'
    const attachmentCount = options.attachmentCount ?? 0
    const attachmentResolution = options.attachmentResolution ?? 'medium'
    const enhanceScript = options.enhanceScript !== false
    const charLen = options.scriptCharLength ?? 0

    const tokenEst =
      options.estimatedPromptTokens != null && options.estimatedOutputTokens != null
        ? {
            promptTokens: Math.max(
              0,
              Math.min(AI_BILLING.VOICE_TTS_TOKEN_CAP, options.estimatedPromptTokens),
            ),
            outputTokens: Math.max(
              0,
              Math.min(AI_BILLING.VOICE_TTS_TOKEN_CAP, options.estimatedOutputTokens),
            ),
          }
        : defaultVoiceTtsTokenEstimates(charLen, attachmentCount)

    const { exchangeRate } = this.config
    const { baseDzd, usedLocalCost } = this._voiceoverBaseUserCostDzd(
      modelId,
      tokenEst.promptTokens,
      tokenEst.outputTokens,
    )
    const attachExtra = this._attachmentExtraUserDzd(attachmentCount, attachmentResolution)
    const enhanceExtra = enhanceScript ? AI_BILLING.VOICEOVER_ENHANCE_ADDON_DZD : 0
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
    const { exchangeRate } = this.config
    const costDzd = AI_BILLING.IMAGE_LANDING_PAGE_FIXED_COST_DZD
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
