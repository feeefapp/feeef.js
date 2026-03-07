import { AxiosInstance } from 'axios'
import {
  ImageGeneration,
  ImageGenerationGalleryOptions,
  ImageGenerationGenerateInput,
  ImageGenerationListOptions,
  ImageGenerationPublishInput,
  PaginatedResourceResponse,
  createImageGenerationFormData,
  normalizeImageGeneration,
  normalizePaginatedResponse,
} from '../../core/entities/image_generation.js'

/**
 * Repository for async image-generation flows.
 */
export class ImageGenerationsRepository {
  client: AxiosInstance
  resource = 'image_generations'

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async list(
    options?: ImageGenerationListOptions
  ): Promise<PaginatedResourceResponse<ImageGeneration>> {
    const { page = 1, limit = 10, storeId, tags, params } = options || {}
    const response = await this.client.get(`/${this.resource}`, {
      params: {
        page,
        limit,
        ...params,
        ...(storeId ? { store_id: storeId } : {}),
        ...(tags && tags.length > 0 ? { tags } : {}),
      },
    })

    return normalizePaginatedResponse(response.data, normalizeImageGeneration)
  }

  async gallery(
    options?: ImageGenerationGalleryOptions
  ): Promise<PaginatedResourceResponse<ImageGeneration>> {
    const { page = 1, limit = 24, params } = options || {}
    const response = await this.client.get(`/${this.resource}/gallery`, {
      params: { page, limit, ...params },
    })

    return normalizePaginatedResponse(response.data, normalizeImageGeneration)
  }

  async find(id: string): Promise<ImageGeneration> {
    const response = await this.client.get(`/${this.resource}/${id}`)
    return normalizeImageGeneration(response.data)
  }

  async createImageGeneration(
    input: ImageGenerationGenerateInput & { storeId: string }
  ): Promise<ImageGeneration> {
    return this.generateImageGeneration({ ...input, id: null })
  }

  async generateImageGeneration(input: ImageGenerationGenerateInput): Promise<ImageGeneration> {
    const response = await this.client.post(
      `/${this.resource}/generate`,
      createImageGenerationFormData(input),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return normalizeImageGeneration(response.data)
  }

  async rerunGeneration(
    id: string,
    input: Omit<ImageGenerationGenerateInput, 'id'> = {}
  ): Promise<ImageGeneration> {
    const response = await this.client.post(
      `/${this.resource}/${id}/generate`,
      createImageGenerationFormData({ ...input, id }),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return normalizeImageGeneration(response.data)
  }

  async setPublished(input: ImageGenerationPublishInput): Promise<ImageGeneration> {
    const response = await this.client.patch(`/${this.resource}/${input.id}`, {
      status: input.isPublished ? 'published' : 'completed',
    })

    return normalizeImageGeneration(response.data)
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await this.client.delete(`/${this.resource}/${id}`)

    return {
      success: Boolean(response.data?.success),
    }
  }
}

/**
 * Backward-compatible alias with the Dart naming.
 */
export type AiRepository = ImageGenerationsRepository
