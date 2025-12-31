import { AxiosInstance, AxiosProgressEvent, CancelToken } from 'axios'

/**
 * Options for uploading a file
 */
export interface UploadOptions {
  /** The file to upload */
  file: File | Blob
  /** Optional folder path */
  folder?: string
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void
  /** Cancel token for aborting the upload */
  cancelToken?: CancelToken
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  /** Bytes sent */
  loaded: number
  /** Total bytes */
  total: number
  /** Progress percentage (0-100) */
  percentage: number
}

/**
 * Upload result
 */
export interface UploadResult {
  /** URL of the uploaded file */
  url: string
}

/**
 * Options for uploading bytes
 */
export interface UploadBytesOptions {
  /** The bytes to upload */
  bytes: Uint8Array | ArrayBuffer
  /** The filename */
  filename: string
  /** Optional folder path */
  folder?: string
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void
  /** Cancel token for aborting the upload */
  cancelToken?: CancelToken
}

/**
 * Storage service for uploading files
 */
export class StorageService {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Uploads a file
   * @param options - Upload options
   * @returns Promise resolving to the upload result
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', options.file)
    if (options.folder) {
      formData.append('folder', options.folder)
    }

    const response = await this.client.post('/services/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: options.onProgress
        ? (progressEvent: AxiosProgressEvent) => {
            const total = progressEvent.total || 0
            const loaded = progressEvent.loaded || 0
            options.onProgress!({
              loaded,
              total,
              percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
            })
          }
        : undefined,
      cancelToken: options.cancelToken,
    })

    return {
      url: response.data.url,
    }
  }

  /**
   * Uploads bytes directly
   * @param options - Upload options
   * @returns Promise resolving to the upload result
   */
  async uploadBytes(options: UploadBytesOptions): Promise<UploadResult> {
    const blob = new Blob([options.bytes])
    const file = new File([blob], options.filename)

    return this.upload({
      file,
      folder: options.folder,
      onProgress: options.onProgress,
      cancelToken: options.cancelToken,
    })
  }

  /**
   * Uploads a file for a store
   * @param file - The file to upload
   * @param storeId - The store ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadStoreFile(
    file: File | Blob,
    storeId: string,
    options?: {
      subfolder?: string
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    const folder = options?.subfolder
      ? `stores/${storeId}/${options.subfolder}`
      : `stores/${storeId}`

    return this.upload({
      file,
      folder,
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }

  /**
   * Uploads a product image
   * @param file - The file to upload
   * @param storeId - The store ID
   * @param productId - The product ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadProductImage(
    file: File | Blob,
    storeId: string,
    productId: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    return this.uploadStoreFile(file, storeId, {
      subfolder: `products/${productId}`,
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }

  /**
   * Uploads a store logo
   * @param file - The file to upload
   * @param storeId - The store ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadStoreLogo(
    file: File | Blob,
    storeId: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    return this.uploadStoreFile(file, storeId, {
      subfolder: 'logo',
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }

  /**
   * Uploads a store icon
   * @param file - The file to upload
   * @param storeId - The store ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadStoreIcon(
    file: File | Blob,
    storeId: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    return this.uploadStoreFile(file, storeId, {
      subfolder: 'icon',
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }

  /**
   * Uploads a user avatar
   * @param file - The file to upload
   * @param userId - The user ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadUserAvatar(
    file: File | Blob,
    userId: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    return this.upload({
      file,
      folder: `users/${userId}/avatar`,
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }

  /**
   * Uploads a feedback attachment
   * @param file - The file to upload
   * @param feedbackId - The feedback ID
   * @param options - Additional options
   * @returns Promise resolving to the upload result
   */
  async uploadFeedbackAttachment(
    file: File | Blob,
    feedbackId: string,
    options?: {
      onProgress?: (progress: UploadProgress) => void
      cancelToken?: CancelToken
    }
  ): Promise<UploadResult> {
    return this.upload({
      file,
      folder: `feedbacks/${feedbackId}`,
      onProgress: options?.onProgress,
      cancelToken: options?.cancelToken,
    })
  }
}
