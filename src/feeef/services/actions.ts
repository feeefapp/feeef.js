import { type AxiosInstance } from 'axios'

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
    /** Product whose override fields apply (omit / 'none' for store fields). */
    productId?: string
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
    if (productId && productId !== 'none') formData.append('productId', productId)

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
   * Brandstudio asset generation (`POST /ai/brand-assets`).
   *
   * `assetKind=identity` → opaque brand-kit board. Other kinds → transparent PNG.
   */
  async generateBrandAsset(input: {
    logoName: string
    description: string
    colors?: number[]
    aspectRatio?: string
    imageModel?: string
    assetKind?: string
    inputImageUrl?: string
    brandStudioId?: string
    createStudio?: boolean
    attachments?: unknown[]
  }): Promise<{
    success: boolean
    id?: string | null
    brandStudioId?: string | null
    message: string
    error?: string | null
    metadata?: Record<string, unknown> | null
  }> {
    const {
      logoName,
      description,
      colors,
      aspectRatio,
      imageModel,
      assetKind,
      inputImageUrl,
      brandStudioId,
      createStudio,
      attachments,
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
    if (colors && colors.length > 0) {
      body.colors = colors
    }

    const response = await this.client.post('/ai/brand-assets', body)
    const data = response.data || {}
    const metadata =
      data.metadata && typeof data.metadata === 'object'
        ? (data.metadata as Record<string, unknown>)
        : null
    const returnedStudioId =
      (data.brandStudioId as string | undefined) ??
      (metadata?.brandStudioId as string | undefined) ??
      null

    return {
      success: Boolean(data.success),
      id: (data.id as string | undefined) ?? null,
      brandStudioId: returnedStudioId,
      message: (data.message as string | undefined) ?? 'Unknown response',
      error: (data.error as string | undefined) ?? null,
      metadata,
    }
  }

  /**
   * Poststudio asset generation (`POST /ai/post-assets`).
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

    const response = await this.client.post('/ai/post-assets', body)
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
   * Uistudio asset generation (`POST /ai/ui-assets`).
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

    const response = await this.client.post('/ai/ui-assets', body)
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
