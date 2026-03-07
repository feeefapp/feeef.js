import { AxiosInstance } from 'axios'
import { ListResponse, ModelRepository } from './repository.js'
import {
  ImagePromptTemplate,
  ImagePromptTemplateCreate,
  ImagePromptTemplateUpdate,
  normalizeImagePromptTemplate,
  serializeImagePromptTemplateCreate,
  serializeImagePromptTemplateUpdate,
} from '../../core/entities/image_prompt_template.js'

export interface ImagePromptTemplateListOptions {
  page?: number
  offset?: number
  limit?: number
  id?: string
  name?: string
  nameLike?: string
  q?: string
  search?: string
  tags?: string[]
  hasPreview?: boolean
  orderBy?: 'created_at' | 'updated_at' | 'name'
  params?: Record<string, unknown>
}

function toListResponse(value: unknown): ListResponse<ImagePromptTemplate> {
  if (Array.isArray(value)) {
    return {
      data: value.map((item) => normalizeImagePromptTemplate(item)),
    }
  }

  const record = value && typeof value === 'object' ? (value as Record<string, any>) : {}
  const meta = record.meta && typeof record.meta === 'object' ? record.meta : {}

  return {
    data: Array.isArray(record.data)
      ? record.data.map((item) => normalizeImagePromptTemplate(item))
      : [],
    total: Number(meta.total ?? 0) || undefined,
    page: Number(meta.current_page ?? meta.currentPage ?? 0) || undefined,
    limit: Number(meta.per_page ?? meta.perPage ?? 0) || undefined,
  }
}

/**
 * Repository for image prompt template CRUD.
 */
export class ImagePromptTemplatesRepository extends ModelRepository<
  ImagePromptTemplate,
  ImagePromptTemplateCreate,
  ImagePromptTemplateUpdate
> {
  constructor(client: AxiosInstance) {
    super('image_prompt_templates', client)
  }

  async find(options: { id: string; by?: string; params?: Record<string, unknown> }) {
    const response = await this.client.get(`/${this.resource}/${options.id}`, {
      params: {
        by: options.by || 'id',
        ...options.params,
      },
    })

    return normalizeImagePromptTemplate(response.data)
  }

  async list(options?: ImagePromptTemplateListOptions): Promise<ListResponse<ImagePromptTemplate>> {
    const { page, offset, limit, params, ...filters } = options || {}
    const response = await this.client.get(`/${this.resource}`, {
      params: {
        page,
        offset,
        limit,
        ...params,
        ...(filters.id ? { id: filters.id } : {}),
        ...(filters.name ? { name: filters.name } : {}),
        ...(filters.nameLike ? { nameLike: filters.nameLike } : {}),
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.tags ? { tags: filters.tags } : {}),
        ...(typeof filters.hasPreview === 'boolean' ? { hasPreview: filters.hasPreview } : {}),
        ...(filters.orderBy ? { orderBy: filters.orderBy } : {}),
      },
    })

    return toListResponse(response.data)
  }

  async create(
    dataOrOptions:
      | ImagePromptTemplateCreate
      | { data: ImagePromptTemplateCreate; params?: Record<string, unknown> },
    params?: Record<string, unknown>
  ): Promise<ImagePromptTemplate> {
    const wrapped =
      dataOrOptions && typeof dataOrOptions === 'object' && 'data' in dataOrOptions
        ? dataOrOptions
        : { data: dataOrOptions as ImagePromptTemplateCreate, params }

    const response = await this.client.post(
      `/${this.resource}`,
      serializeImagePromptTemplateCreate(wrapped.data),
      {
        params: wrapped.params,
      }
    )

    return normalizeImagePromptTemplate(response.data)
  }

  async update(options: {
    id: string
    data: ImagePromptTemplateUpdate
    params?: Record<string, unknown>
  }): Promise<ImagePromptTemplate> {
    const response = await this.client.put(
      `/${this.resource}/${options.id}`,
      serializeImagePromptTemplateUpdate(options.data),
      {
        params: options.params,
      }
    )

    return normalizeImagePromptTemplate(response.data)
  }
}
