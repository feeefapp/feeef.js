import { AxiosInstance } from 'axios'
import {
  PostStudio,
  PostStudioCreateInput,
  PostStudioGenerationsOptions,
  PostStudioListOptions,
  PostStudioSetPrimaryInput,
  PostStudioUpdateInput,
  normalizePostStudio,
} from '../../core/entities/post_studio.js'
import {
  ImageGeneration,
  PaginatedResourceResponse,
  normalizeImageGeneration,
  normalizePaginatedResponse,
} from '../../core/entities/image_generation.js'

/**
 * Repository for Poststudio projects (`/postStudios`).
 *
 * Generations are created via `ActionsService.generatePostAsset`.
 */
export class PostStudiosRepository {
  client: AxiosInstance
  /** CamelCase resource path matching the Feeef API. */
  resource = 'postStudios'

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async list(
    options?: PostStudioListOptions
  ): Promise<PaginatedResourceResponse<PostStudio>> {
    const { page = 1, limit = 24, params } = options || {}
    const response = await this.client.get(`/${this.resource}`, {
      params: { page, limit, ...params },
    })
    return normalizePaginatedResponse(response.data, normalizePostStudio)
  }

  async create(input: PostStudioCreateInput): Promise<PostStudio> {
    const response = await this.client.post(`/${this.resource}`, input)
    return normalizePostStudio(response.data)
  }

  async find(id: string): Promise<PostStudio> {
    const response = await this.client.get(`/${this.resource}/${id}`)
    return normalizePostStudio(response.data)
  }

  async update(id: string, input: PostStudioUpdateInput): Promise<PostStudio> {
    const response = await this.client.patch(`/${this.resource}/${id}`, input)
    return normalizePostStudio(response.data)
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await this.client.delete(`/${this.resource}/${id}`)
    return {
      success: response.data?.success !== false,
    }
  }

  /**
   * Generation history for one deliverable kind (newest first).
   */
  async generations(
    options: PostStudioGenerationsOptions
  ): Promise<
    PaginatedResourceResponse<ImageGeneration> & { primaryGenerationId?: string | null }
  > {
    const { studioId, kind, page = 1, limit = 40 } = options
    const response = await this.client.get(`/${this.resource}/${studioId}/generations`, {
      params: { kind, page, limit },
    })
    const pageResult = normalizePaginatedResponse(response.data, normalizeImageGeneration)
    const meta = pageResult.meta || {}
    const primary =
      meta.primaryGenerationId != null ? String(meta.primaryGenerationId) : null
    return {
      ...pageResult,
      primaryGenerationId: primary,
    }
  }

  async setPrimary(input: PostStudioSetPrimaryInput): Promise<PostStudio> {
    const { studioId, kind, generationId } = input
    const response = await this.client.patch(`/${this.resource}/${studioId}/primaries`, {
      kind,
      generationId,
    })
    return normalizePostStudio(response.data)
  }
}
