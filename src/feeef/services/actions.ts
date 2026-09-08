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

  /**
   * Brandstudio asset generation (`POST /actions/generateBrandAsset`).
   *
   * `assetKind=identity` → opaque brand-kit board. Other kinds → transparent PNG.
   * Returns both `brandStudioId` and deprecated `identityStudioId` (same value).
   */
  async generateBrandAsset(input: {
    logoName: string
    description: string
    color1?: number
    color2?: number
    colors?: number[]
    aspectRatio?: string
    imageModel?: string
    assetKind?: string
    inputImageUrl?: string
    brandStudioId?: string
    createStudio?: boolean
    attachments?: unknown[]
    referenceImageUrls?: string[]
    referenceImageLabels?: Record<string, string>
  }): Promise<{
    success: boolean
    id?: string | null
    brandStudioId?: string | null
    identityStudioId?: string | null
    message: string
    error?: string | null
    metadata?: Record<string, unknown> | null
  }> {
    const {
      logoName,
      description,
      color1,
      color2,
      colors,
      aspectRatio,
      imageModel,
      assetKind,
      inputImageUrl,
      brandStudioId,
      createStudio,
      attachments,
      referenceImageUrls,
      referenceImageLabels,
    } = input

    const body: Record<string, unknown> = {
      logoName: logoName.trim(),
      description: description.trim(),
    }
    if (aspectRatio) body.aspectRatio = aspectRatio
    if (imageModel?.trim()) body.imageModel = imageModel.trim()
    if (assetKind?.trim()) body.assetKind = assetKind.trim()
    if (inputImageUrl?.trim()) body.inputImageUrl = inputImageUrl.trim()
    if (brandStudioId?.trim()) body.brandStudioId = brandStudioId.trim()
    if (createStudio) body.createStudio = true
    if (attachments && attachments.length > 0) body.attachments = attachments
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      body.referenceImageUrls = referenceImageUrls
    }
    if (referenceImageLabels && Object.keys(referenceImageLabels).length > 0) {
      body.referenceImageLabels = referenceImageLabels
    }
    if (colors && colors.length > 0) {
      body.colors = colors
    } else if (color1 != null && color2 != null) {
      body.color1 = color1
      body.color2 = color2
    }

    const response = await this.client.post('/actions/generateBrandAsset', body)
    const data = response.data || {}
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : null
    const returnedStudioId =
      (data.brandStudioId as string | undefined) ??
      (metadata?.brandStudioId as string | undefined) ??
      (data.identityStudioId as string | undefined) ??
      (metadata?.identityStudioId as string | undefined) ??
      null

    return {
      success: Boolean(data.success),
      id: (data.id as string | undefined) ?? null,
      brandStudioId: returnedStudioId,
      identityStudioId: returnedStudioId,
      message: (data.message as string | undefined) ?? 'Unknown response',
      error: (data.error as string | undefined) ?? null,
      metadata,
    }
  }

  /**
   * Legacy Identity Studio action (`POST /actions/generateLogo`).
   * Prefer [generateBrandAsset]. Maps `identityStudioId` → request field of the same name.
   */
  async generateLogo(input: {
    logoName: string
    description: string
    color1?: number
    color2?: number
    colors?: number[]
    aspectRatio?: string
    imageModel?: string
    assetKind?: string
    inputImageUrl?: string
    identityStudioId?: string
    brandStudioId?: string
    createStudio?: boolean
    attachments?: unknown[]
    referenceImageUrls?: string[]
    referenceImageLabels?: Record<string, string>
  }): Promise<{
    success: boolean
    id?: string | null
    brandStudioId?: string | null
    identityStudioId?: string | null
    message: string
    error?: string | null
    metadata?: Record<string, unknown> | null
  }> {
    const {
      logoName,
      description,
      color1,
      color2,
      colors,
      aspectRatio,
      imageModel,
      assetKind,
      inputImageUrl,
      identityStudioId,
      brandStudioId,
      createStudio,
      attachments,
      referenceImageUrls,
      referenceImageLabels,
    } = input

    const studioId = brandStudioId ?? identityStudioId
    const body: Record<string, unknown> = {
      logoName: logoName.trim(),
      description: description.trim(),
    }
    if (aspectRatio) body.aspectRatio = aspectRatio
    if (imageModel?.trim()) body.imageModel = imageModel.trim()
    if (assetKind?.trim()) body.assetKind = assetKind.trim()
    if (inputImageUrl?.trim()) body.inputImageUrl = inputImageUrl.trim()
    if (studioId?.trim()) {
      body.identityStudioId = studioId.trim()
      body.brandStudioId = studioId.trim()
    }
    if (createStudio) body.createStudio = true
    if (attachments && attachments.length > 0) body.attachments = attachments
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      body.referenceImageUrls = referenceImageUrls
    }
    if (referenceImageLabels && Object.keys(referenceImageLabels).length > 0) {
      body.referenceImageLabels = referenceImageLabels
    }
    if (colors && colors.length > 0) {
      body.colors = colors
    } else if (color1 != null && color2 != null) {
      body.color1 = color1
      body.color2 = color2
    }

    const response = await this.client.post('/actions/generateLogo', body)
    const data = response.data || {}
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : null
    const returnedStudioId =
      (data.brandStudioId as string | undefined) ??
      (metadata?.brandStudioId as string | undefined) ??
      (data.identityStudioId as string | undefined) ??
      (metadata?.identityStudioId as string | undefined) ??
      null

    return {
      success: Boolean(data.success),
      id: (data.id as string | undefined) ?? null,
      brandStudioId: returnedStudioId,
      identityStudioId: returnedStudioId,
      message: (data.message as string | undefined) ?? 'Unknown response',
      error: (data.error as string | undefined) ?? null,
      metadata,
    }
  }

  /**
   * Poststudio asset generation (`POST /actions/generatePostAsset`).
   * Pass `postStudioId` or `createStudio: true`.
   */
  async generatePostAsset(input: {
    name: string
    brief: string
    assetKind?: string
    regionStyle?: string
    aspectRatio?: string
    imageModel?: string
    postStudioId?: string
    createStudio?: boolean
    inputImageUrl?: string
    referenceImageUrls?: string[]
  }): Promise<{
    success: boolean
    id?: string | null
    postStudioId?: string | null
    message: string
    error?: string | null
    metadata?: Record<string, unknown> | null
  }> {
    const {
      name,
      brief,
      assetKind,
      regionStyle,
      aspectRatio,
      imageModel,
      postStudioId,
      createStudio,
      inputImageUrl,
      referenceImageUrls,
    } = input

    const body: Record<string, unknown> = {
      name: name.trim(),
      brief: brief.trim(),
    }
    if (assetKind?.trim()) body.assetKind = assetKind.trim()
    if (regionStyle?.trim()) body.regionStyle = regionStyle.trim()
    if (aspectRatio) body.aspectRatio = aspectRatio
    if (imageModel?.trim()) body.imageModel = imageModel.trim()
    if (postStudioId?.trim()) body.postStudioId = postStudioId.trim()
    if (createStudio) body.createStudio = true
    if (inputImageUrl?.trim()) body.inputImageUrl = inputImageUrl.trim()
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      body.referenceImageUrls = referenceImageUrls
    }

    const response = await this.client.post('/actions/generatePostAsset', body)
    const data = response.data || {}
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : null
    const returnedStudioId =
      (data.postStudioId as string | undefined) ??
      (metadata?.postStudioId as string | undefined) ??
      null

    return {
      success: Boolean(data.success),
      id: (data.id as string | undefined) ?? null,
      postStudioId: returnedStudioId,
      message: (data.message as string | undefined) ?? 'Unknown response',
      error: (data.error as string | undefined) ?? null,
      metadata,
    }
  }

  /**
   * Uistudio asset generation (`POST /actions/generateUiAsset`).
   * Pass `uiStudioId` or `createStudio: true`.
   */
  async generateUiAsset(input: {
    name: string
    brief: string
    assetKind?: string
    style?: string
    aspectRatio?: string
    imageModel?: string
    uiStudioId?: string
    createStudio?: boolean
    inputImageUrl?: string
    referenceImageUrls?: string[]
  }): Promise<{
    success: boolean
    id?: string | null
    uiStudioId?: string | null
    message: string
    error?: string | null
    metadata?: Record<string, unknown> | null
  }> {
    const {
      name,
      brief,
      assetKind,
      style,
      aspectRatio,
      imageModel,
      uiStudioId,
      createStudio,
      inputImageUrl,
      referenceImageUrls,
    } = input

    const body: Record<string, unknown> = {
      name: name.trim(),
      brief: brief.trim(),
    }
    if (assetKind?.trim()) body.assetKind = assetKind.trim()
    if (style?.trim()) body.style = style.trim()
    if (aspectRatio) body.aspectRatio = aspectRatio
    if (imageModel?.trim()) body.imageModel = imageModel.trim()
    if (uiStudioId?.trim()) body.uiStudioId = uiStudioId.trim()
    if (createStudio) body.createStudio = true
    if (inputImageUrl?.trim()) body.inputImageUrl = inputImageUrl.trim()
    if (referenceImageUrls && referenceImageUrls.length > 0) {
      body.referenceImageUrls = referenceImageUrls
    }

    const response = await this.client.post('/actions/generateUiAsset', body)
    const data = response.data || {}
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : null
    const returnedStudioId =
      (data.uiStudioId as string | undefined) ??
      (metadata?.uiStudioId as string | undefined) ??
      null

    return {
      success: Boolean(data.success),
      id: (data.id as string | undefined) ?? null,
      uiStudioId: returnedStudioId,
      message: (data.message as string | undefined) ?? 'Unknown response',
      error: (data.error as string | undefined) ?? null,
      metadata,
    }
  }
}
