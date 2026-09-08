import { AxiosInstance } from 'axios'
import {
  BrandStudio,
  BrandStudioCreateInput,
  BrandStudioGenerationsOptions,
  BrandStudioListOptions,
  BrandStudioSetPrimaryInput,
  BrandStudioUpdateInput,
  normalizeBrandStudio,
} from '../../core/entities/brand_studio.js'
import {
  ImageGeneration,
  PaginatedResourceResponse,
  normalizeImageGeneration,
  normalizePaginatedResponse,
} from '../../core/entities/image_generation.js'

/**
 * Repository for Brandstudio projects (`/brandStudios`).
 *
 * Generations are created via `ActionsService.generateBrandAsset`.
 */
export class BrandStudiosRepository {
  client: AxiosInstance
  /** CamelCase resource path matching the Feeef API. */
  resource = 'brandStudios'

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async list(
    options?: BrandStudioListOptions
  ): Promise<PaginatedResourceResponse<BrandStudio>> {
    const { page = 1, limit = 24, params } = options || {}
    const response = await this.client.get(`/${this.resource}`, {
      params: { page, limit, ...params },
    })
    return normalizePaginatedResponse(response.data, normalizeBrandStudio)
  }

  async create(input: BrandStudioCreateInput): Promise<BrandStudio> {
    const response = await this.client.post(`/${this.resource}`, input)
    return normalizeBrandStudio(response.data)
  }

  async find(id: string): Promise<BrandStudio> {
    const response = await this.client.get(`/${this.resource}/${id}`)
    return normalizeBrandStudio(response.data)
  }

  async update(id: string, input: BrandStudioUpdateInput): Promise<BrandStudio> {
    const response = await this.client.patch(`/${this.resource}/${id}`, input)
    return normalizeBrandStudio(response.data)
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
    options: BrandStudioGenerationsOptions
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

  async setPrimary(input: BrandStudioSetPrimaryInput): Promise<BrandStudio> {
    const { studioId, kind, generationId } = input
    const response = await this.client.patch(`/${this.resource}/${studioId}/primaries`, {
      kind,
      generationId,
    })
    return normalizeBrandStudio(response.data)
  }
}
