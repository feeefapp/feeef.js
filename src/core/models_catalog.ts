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

/** `GET /v1/models` row + `provider_slug` for Feeef's registry lookup. */
export type ModelCatalogRow = import('@openrouter/sdk/models').Model & {
  provider_slug: string
}

export interface ModelsCatalogConfig {
  providers: ProviderRegistryRow[]
  data: ModelCatalogRow[]
}
