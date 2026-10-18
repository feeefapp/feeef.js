import type { AxiosInstance } from 'axios'
import type {
  StorePageDocument,
  StorePageEntity,
  WebsiteExport,
} from '../../core/entities/store_page.js'

const base = (storeId: string) => `/stores/${encodeURIComponent(storeId)}/pages`
const item = (storeId: string, id: string) => `${base(storeId)}/${encodeURIComponent(id)}`
export type StorePageAction = 'publish' | 'unpublish' | 'duplicate' | 'delete' | 'restore'

export class StorePagesRepository {
  constructor(private readonly client: AxiosInstance) {}
  async list(
    storeId: string,
    params?: {
      page?: number
      limit?: number
      search?: string
      status?: 'draft' | 'published' | 'deleted'
      sort?: string
      direction?: 'asc' | 'desc'
    }
  ) {
    const response = await this.client.get<{
      data: StorePageEntity[]
      meta: { total: number; currentPage: number; lastPage: number }
      counts: Record<string, number>
    }>(base(storeId), { params })
    return response.data
  }
  async find(storeId: string, id: string) {
    const response = await this.client.get<StorePageEntity>(item(storeId, id))
    return response.data
  }
  async create(
    storeId: string,
    data: StorePageDocument & { pageTemplateId?: string; pageTemplateVersion?: number }
  ) {
    const response = await this.client.post<StorePageEntity>(base(storeId), data)
    return response.data
  }
  async update(
    storeId: string,
    id: string,
    data: Partial<StorePageDocument> & { expectedRevision: number }
  ) {
    const response = await this.client.put<StorePageEntity>(item(storeId, id), data)
    return response.data
  }
  async action(
    storeId: string,
    id: string,
    action: Exclude<StorePageAction, 'delete'>,
    expectedRevision: number,
    operationId?: string
  ) {
    const response = await this.client.post<StorePageEntity>(`${item(storeId, id)}/${action}`, {
      expectedRevision,
      ...(operationId !== undefined ? { operationId } : {}),
    })
    return response.data
  }
  async delete(storeId: string, id: string, expectedRevision: number) {
    await this.client.delete(item(storeId, id), { data: { expectedRevision } })
  }
  async bulk(
    storeId: string,
    action: StorePageAction,
    items: Array<{ id: string; expectedRevision: number }>,
    operationId: string
  ) {
    const response = await this.client.post<{
      results: Array<{ id: string; ok: boolean; code?: string; page?: StorePageEntity }>
      succeeded: number
      failed: number
    }>(`${base(storeId)}/bulk`, { action, items, operationId })
    return response.data
  }
  async preview(storeId: string, id: string, expectedRevision: number) {
    const response = await this.client.post<{
      token: string
      path: string
      revision: number
      expiresAt: string
    }>(`${item(storeId, id)}/preview`, { expectedRevision })
    return response.data
  }
  async export(storeId: string, id: string) {
    const response = await this.client.get<WebsiteExport>(`${item(storeId, id)}/export`)
    return response.data
  }
  async publishTemplate(
    storeId: string,
    id: string,
    data: {
      expectedRevision: number
      title: string
      description?: string
      policy?: 'private' | 'public'
    }
  ) {
    const response = await this.client.post<Record<string, unknown>>(
      `${item(storeId, id)}/template`,
      data
    )
    return response.data
  }
}
