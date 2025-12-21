import { AxiosInstance } from 'axios'

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
}
