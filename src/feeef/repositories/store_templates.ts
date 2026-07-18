import { AxiosInstance } from 'axios'
import { ListResponse, ModelRepository } from './repository.js'
import {
  StoreTemplateEntity,
  StoreTemplateCreateInput,
  StoreTemplateUpdateInput,
  StoreTemplateLocaleEntity,
  StoreTemplateLocaleInput,
  StoreTemplateLocalesBundle,
  StoreTemplateReleaseEntity,
  StoreTemplatePurchaseResult,
  StoreTemplateReleaseCreateInput,
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
   * Set `stores.template_id` (+ optional release pin) and copy release/listing
   * `data` into `store.metadata.templateData`. Paid listings require a license.
   */
  async install(options: { fromId: string; storeId: string; releaseId?: string }): Promise<{
    storeTemplate: StoreTemplateEntity
    store: Record<string, unknown>
    release?: StoreTemplateReleaseEntity | null
    license?: Record<string, unknown> | null
  }> {
    const res = await this.client.post(`/${this.resource}/${options.fromId}/install`, {
      storeId: options.storeId,
      ...(options.releaseId ? { releaseId: options.releaseId } : {}),
    })
    return res.data as {
      storeTemplate: StoreTemplateEntity
      store: Record<string, unknown>
      release?: StoreTemplateReleaseEntity | null
      license?: Record<string, unknown> | null
    }
  }

  /** One-time wallet purchase → forever store license. */
  async purchase(options: {
    fromId: string
    storeId: string
  }): Promise<StoreTemplatePurchaseResult> {
    const res = await this.client.post(`/${this.resource}/${options.fromId}/purchase`, {
      storeId: options.storeId,
    })
    return res.data as StoreTemplatePurchaseResult
  }

  /** List immutable releases (newest first). */
  async listReleases(
    templateId: string,
    options?: { storeId?: string }
  ): Promise<{ data: StoreTemplateReleaseEntity[] }> {
    const res = await this.client.get(`/${this.resource}/${templateId}/releases`, {
      params: options?.storeId ? { storeId: options.storeId } : undefined,
    })
    return res.data as { data: StoreTemplateReleaseEntity[] }
  }

  async getRelease(
    templateId: string,
    releaseId: string,
    options?: { storeId?: string }
  ): Promise<StoreTemplateReleaseEntity> {
    const res = await this.client.get(`/${this.resource}/${templateId}/releases/${releaseId}`, {
      params: options?.storeId ? { storeId: options.storeId } : undefined,
    })
    return res.data as StoreTemplateReleaseEntity
  }

  /** Author publishes a new immutable release. */
  async createRelease(
    templateId: string,
    input: StoreTemplateReleaseCreateInput
  ): Promise<StoreTemplateReleaseEntity> {
    const res = await this.client.post(`/${this.resource}/${templateId}/releases`, input)
    return res.data as StoreTemplateReleaseEntity
  }

  /** Public render payload for historical / marketing preview (no auth required for public listings). */
  async renderRelease(
    templateId: string,
    releaseId: string
  ): Promise<{
    storeTemplateId: string
    releaseId: string
    version: string
    changelog: string | null
    data: Record<string, unknown>
    schema?: Record<string, unknown>
  }> {
    const res = await this.client.get(
      `/${this.resource}/${templateId}/releases/${releaseId}/render`
    )
    return res.data
  }

  async listReviews(
    templateId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{
    data: Array<Record<string, unknown>>
    meta: { total: number; page: number; limit: number }
    ratingAvg: number
    ratingCount: number
  }> {
    const res = await this.client.get(`/${this.resource}/${templateId}/reviews`, {
      params: options,
    })
    return res.data
  }

  async upsertReview(options: {
    templateId: string
    storeId: string
    rating: number
    body?: string | null
  }): Promise<{
    review: Record<string, unknown>
    ratingAvg: number
    ratingCount: number
  }> {
    const res = await this.client.post(`/${this.resource}/${options.templateId}/reviews`, {
      storeId: options.storeId,
      rating: options.rating,
      body: options.body ?? null,
    })
    return res.data
  }

  async earnings(): Promise<{
    totalSales: number
    totalAuthorAmount: number
    totalPlatformAmount: number
    byTemplate: Array<{
      storeTemplateId: string
      title: string
      sales: number
      authorAmount: number
      platformAmount: number
    }>
  }> {
    const res = await this.client.get(`/store_templates_earnings`)
    return res.data
  }

  /** GET locales bundle (`defaultLocale`, `locales`, `messages`). */
  async listLocales(templateId: string): Promise<StoreTemplateLocalesBundle> {
    const res = await this.client.get(`/${this.resource}/${templateId}/locales`)
    return res.data as StoreTemplateLocalesBundle
  }

  /** Create one locale row. */
  async createLocale(
    templateId: string,
    input: StoreTemplateLocaleInput
  ): Promise<StoreTemplateLocaleEntity> {
    const res = await this.client.post(`/${this.resource}/${templateId}/locales`, input)
    return res.data as StoreTemplateLocaleEntity
  }

  /** Update one locale by language code. */
  async updateLocale(
    templateId: string,
    locale: string,
    input: Partial<Pick<StoreTemplateLocaleInput, 'messages' | 'isDefault'>>
  ): Promise<StoreTemplateLocaleEntity> {
    const res = await this.client.put(`/${this.resource}/${templateId}/locales/${locale}`, input)
    return res.data as StoreTemplateLocaleEntity
  }

  /** Delete one locale by language code. */
  async deleteLocale(templateId: string, locale: string): Promise<void> {
    await this.client.delete(`/${this.resource}/${templateId}/locales/${locale}`)
  }

  /** Replace the full locale set (CLI publish). */
  async replaceLocales(
    templateId: string,
    locales: StoreTemplateLocaleInput[]
  ): Promise<StoreTemplateLocalesBundle> {
    const res = await this.client.put(`/${this.resource}/${templateId}/locales`, { locales })
    return res.data as StoreTemplateLocalesBundle
  }
}
