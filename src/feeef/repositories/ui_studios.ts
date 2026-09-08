import { AxiosInstance } from 'axios'
import {
  UiStudio,
  UiStudioCreateInput,
  UiStudioGenerationsOptions,
  UiStudioListOptions,
  UiStudioSetPrimaryInput,
  UiStudioUpdateInput,
  normalizeUiStudio,
} from '../../core/entities/ui_studio.js'
import {
  ImageGeneration,
  PaginatedResourceResponse,
  normalizeImageGeneration,
  normalizePaginatedResponse,
} from '../../core/entities/image_generation.js'

/**
 * Repository for Uistudio projects (`/uiStudios`).
 *
 * Generations are created via `ActionsService.generateUiAsset`.
 */
export class UiStudiosRepository {
  client: AxiosInstance
  /** CamelCase resource path matching the Feeef API. */
  resource = 'uiStudios'

  constructor(client: AxiosInstance) {
    this.client = client
  }

  async list(options?: UiStudioListOptions): Promise<PaginatedResourceResponse<UiStudio>> {
    const { page = 1, limit = 24, params } = options || {}
    const response = await this.client.get(`/${this.resource}`, {
      params: { page, limit, ...params },
    })
    return normalizePaginatedResponse(response.data, normalizeUiStudio)
  }

  async create(input: UiStudioCreateInput): Promise<UiStudio> {
    const response = await this.client.post(`/${this.resource}`, input)
    return normalizeUiStudio(response.data)
  }

  async find(id: string): Promise<UiStudio> {
    const response = await this.client.get(`/${this.resource}/${id}`)
    return normalizeUiStudio(response.data)
  }

  async update(id: string, input: UiStudioUpdateInput): Promise<UiStudio> {
    const response = await this.client.patch(`/${this.resource}/${id}`, input)
    return normalizeUiStudio(response.data)
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
    options: UiStudioGenerationsOptions
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

  async setPrimary(input: UiStudioSetPrimaryInput): Promise<UiStudio> {
    const { studioId, kind, generationId } = input
    const response = await this.client.patch(`/${this.resource}/${studioId}/primaries`, {
      kind,
      generationId,
    })
    return normalizeUiStudio(response.data)
  }
}
