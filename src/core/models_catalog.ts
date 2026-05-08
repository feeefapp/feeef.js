/**
 * Multi-provider model catalog (options key `models`).
 * Re-uses OpenRouter **Models API** types (`Model`, `ModelsListResponse`) for parity with
 * `curl https://openrouter.ai/api/v1/models` and `@openrouter/sdk`.
 *
 * @see https://openrouter.ai/docs/guides/overview/models
 * @see https://openrouter.ai/docs/api-reference/models/get-models
 */
export type {
  DefaultParameters,
  InputModality,
  Model,
  ModelArchitecture,
  ModelLinks,
  ModelsListResponse,
  OutputModality,
  Parameter,
  PerRequestLimits,
  PublicPricing,
  TopProviderInfo,
} from '@openrouter/sdk/models'

/** Feeef routing — not part of OpenRouter's schema. */
export type AiProviderKind = 'google' | 'openai' | 'openrouter'

export interface ProviderRegistryRow {
  slug: string
  kind: AiProviderKind
  baseUrl: string
  displayName?: string
  name?: string
}

/**
 * Feeef catalog extensions (not from OpenRouter Models API).
 * Optional `capabilities.image_generation` drives aspect/output tiers and pricing add-ons.
 */
export interface ImageGenerationCapabilitiesWire {
  allowed_aspect_ratios?: string[]
  output_size_tiers?: string[]
  input_resolution_tiers?: string[]
  params?: {
    background?: string[]
    quality?: string[]
    output_format?: string[]
  }
  toggles?: {
    google_search?: boolean
    image_search?: boolean
  }
  pricing_addons_dzd?: {
    transparent_background?: number
  }
}

export interface FeeefModelCapabilities {
  image_generation?: ImageGenerationCapabilitiesWire
}

/** `GET /v1/models` row + `provider_slug` for Feeef's registry lookup. */
export type ModelCatalogRow = import('@openrouter/sdk/models').Model & {
  provider_slug: string
  capabilities?: FeeefModelCapabilities
}

export interface ModelsCatalogConfig {
  providers: ProviderRegistryRow[]
  data: ModelCatalogRow[]
}
