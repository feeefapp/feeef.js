import { AxiosInstance } from 'axios'
import { ListResponse, ModelRepository } from './repository.js'
import {
  StoreTemplateEntity,
  StoreTemplateCreateInput,
  StoreTemplateUpdateInput,
} from '../../core/entities/store_template.js'
import { TemplateComponentPolicy } from '../../core/entities/template_component.js'

export interface StoreTemplateListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  q?: string
  search?: string
  policy?: TemplateComponentPolicy | TemplateComponentPolicy[]
  category?: string | string[]
  tags?: string | string[]
  parentId?: string
  filterator?: string | object
  orderBy?: 'created_at' | 'updated_at' | 'title' | 'price'
  params?: Record<string, unknown>
}

function normalizeFilterator(value: StoreTemplateListOptions['filterator']): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function toListResponse(value: unknown): ListResponse<StoreTemplateEntity> {
  if (Array.isArray(value)) {
    return { data: value as StoreTemplateEntity[] }
  }
  const record = value && typeof value === 'object' ? (value as Record<string, any>) : {}
  const meta = record.meta && typeof record.meta === 'object' ? record.meta : {}
  return {
    data: Array.isArray(record.data) ? (record.data as StoreTemplateEntity[]) : [],
    total: Number(meta.total ?? 0) || undefined,
    page: Number(meta.current_page ?? meta.currentPage ?? 0) || undefined,
    limit: Number(meta.per_page ?? meta.perPage ?? 0) || undefined,
  }
}

export class StoreTemplatesRepository extends ModelRepository<
  StoreTemplateEntity,
  StoreTemplateCreateInput,
  StoreTemplateUpdateInput
> {
  constructor(client: AxiosInstance) {
    super('store_templates', client)
  }

  async list(options?: StoreTemplateListOptions): Promise<ListResponse<StoreTemplateEntity>> {
    const { page, offset, limit, params, filterator, ...filters } = options || {}

    const res = await this.client.get(`/${this.resource}`, {
      params: {
        page,
        offset,
        limit,
        ...(filters.storeId ? { storeId: filters.storeId } : {}),
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.policy ? { policy: filters.policy } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.tags ? { tags: filters.tags } : {}),
        ...(filters.parentId ? { parentId: filters.parentId } : {}),
        ...(filters.orderBy ? { orderBy: filters.orderBy } : {}),
        ...(filterator ? { filterator: normalizeFilterator(filterator) } : {}),
        ...params,
      },
    })

    return toListResponse(res.data)
  }

  async fork(options: {
    fromId: string
    storeId: string
    title?: string
  }): Promise<StoreTemplateEntity> {
    const res = await this.client.post(`/${this.resource}/${options.fromId}/fork`, {
      storeId: options.storeId,
      ...(options.title ? { title: options.title } : {}),
    })
    return res.data as StoreTemplateEntity
  }

  /**
   * Set `stores.template_id` to this template (same row in `store_templates`)
   * and copy `data` into `store.metadata.templateData`. Does not create a new
   * `store_templates` row — use [fork] to duplicate a template into a store.
   */
  async install(options: {
    fromId: string
    storeId: string
  }): Promise<{ storeTemplate: StoreTemplateEntity; store: Record<string, unknown> }> {
    const res = await this.client.post(`/${this.resource}/${options.fromId}/install`, {
      storeId: options.storeId,
    })
    return res.data as { storeTemplate: StoreTemplateEntity; store: Record<string, unknown> }
  }
}
