import { AxiosInstance } from 'axios'
import { TemplateComponentPolicy } from '../../core/entities/template_component.js'

/**
 * Slim, render-ready shape returned by `actions/resolveComponents` for a
 * single library entry. The storefront merges these into the template's
 * `reference`-typed placements before rendering.
 *
 * Catalog metadata (subtitle, body, tags, screenshots, …) is intentionally
 * excluded — the resolve endpoint optimizes for cache size and wire weight,
 * and the marketplace UI uses the regular `template_components` REST
 * resource for browsing.
 */
export interface ResolvedTemplateComponent {
  id: string
  storeId: string
  /**
   * Monotonic version (server-managed). Storefronts can use this as a
   * pinning target to detect drift between resolve calls.
   */
  version: number
  policy: TemplateComponentPolicy
  title: string
  /** JSX source consumed by `react-live`. */
  code: string
  propsSchema: Record<string, unknown>
  slotsSchema: Record<string, unknown> | null
  propsDefault: Record<string, unknown>
  slotsDefault: Record<string, unknown> | null
  slotsLayout: Record<string, unknown> | null
  /** Mirror of `policy === 'deprecated'` for cheap rendering hints. */
  deprecated: boolean
}

/**
 * Response shape for `actions/resolveComponents`. `resolved` is keyed by
 * library entry id so the renderer can do an O(1) lookup; `missing` lists
 * ids that did not exist or weren't visible to the caller (the renderer
 * should fall back to a no-op for these).
 */
export interface ResolveComponentsResponse {
  resolved: Record<string, ResolvedTemplateComponent>
  missing: string[]
}

/**
 * Actions service for performing various actions on the Feeef API.
 * Similar to the Dart Actions class, this provides methods for file uploads,
 * integrations, and other action-based operations.
 */
export class ActionsService {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Uploads a file or image for custom fields in orders.
   * Files are saved to u/{userId}/stores/{storeId}/customFields/{fieldId}/{filename}
   *
   * @param file - The file to upload (File or Blob)
   * @param storeId - The store ID
   * @param fieldId - The custom field ID
   * @param productId - The product ID
   * @returns Promise resolving to the uploaded file URL and metadata
   */
  async uploadCustomFieldFile({
    file,
    storeId,
    fieldId,
    productId,
  }: {
    file: File | Blob
    storeId: string
    fieldId: string
    productId: string
  }): Promise<{
    url: string
    filename: string
    fieldId: string
    storeId: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('storeId', storeId)
    formData.append('fieldId', fieldId)
    formData.append('productId', productId)

    // Debug: log the baseURL and full URL that will be used
    if (
      typeof globalThis !== 'undefined' &&
      'window' in globalThis &&
      process.env.NODE_ENV === 'development'
    ) {
      const baseURL = this.client.defaults.baseURL || ''
      const fullURL = baseURL
        ? `${baseURL}/actions/uploadCustomFieldFile`
        : '/actions/uploadCustomFieldFile'
      console.log('[ActionsService] Uploading to:', fullURL)
      console.log('[ActionsService] Client baseURL:', this.client.defaults.baseURL)
    }

    // Use the same pattern as other repositories - relative URL with baseURL from client defaults
    const response = await this.client.post('/actions/uploadCustomFieldFile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      url: response.data.url,
      filename: response.data.filename,
      fieldId: response.data.fieldId,
      storeId: response.data.storeId,
    }
  }

  /**
   * Resolve a batch of library `template_components` by id for the
   * storefront / editor renderer.
   *
   * Used by SSR pages that walk the template tree, gather every
   * `reference`-typed placement's `refId`, and need the renderable
   * `{ code, propsSchema, slotsSchema, defaults }` payload before the
   * page can be rendered.
   *
   * Authorization is per-id and happens server-side: same-store entries
   * are always returned; cross-store entries must be `policy in
   * (public, deprecated)`. Anything else is silently dropped into
   * `missing` so the page can render with a fallback (typically a
   * no-op or a "This component is unavailable" placeholder).
   *
   * The response is cached server-side per `(storeId, version)` for 24h
   * and the cache is invalidated automatically on any
   * `template_components` mutation or `Store` update — clients can call
   * this as often as they like without extra coordination.
   *
   * @param storeId - The store identifying the rendering context.
   * @param ids     - Library entry ids to resolve. Deduplicated server-side.
   */
  async resolveComponents({
    storeId,
    ids,
  }: {
    storeId: string
    ids: string[]
  }): Promise<ResolveComponentsResponse> {
    const response = await this.client.post<ResolveComponentsResponse>(
      '/actions/resolveComponents',
      { storeId, ids }
    )
    return response.data
  }
}
