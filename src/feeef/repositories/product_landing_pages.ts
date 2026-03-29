import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  ProductLandingPage,
  ProductLandingPageCreate,
  ProductLandingPageUpdate,
} from '../../core/entities/product_landing_page.js'
import type { LiteOrdersReport } from '../../core/entities/order.js'

/**
 * Options for listing product landing pages
 */
export interface ProductLandingPageListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  productId?: string
  params?: Record<string, any>
}

/**
 * Represents a repository for managing product landing pages.
 */
export class ProductLandingPagesRepository extends ModelRepository<
  ProductLandingPage,
  ProductLandingPageCreate,
  ProductLandingPageUpdate
> {
  /**
   * Creates a new instance of ProductLandingPagesRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('product_landing_pages', client)
  }

  /**
   * Lists product landing pages with optional filtering.
   * @param options - The options for listing product landing pages.
   * @returns A Promise that resolves to a list of ProductLandingPage entities.
   */
  async list(options?: ProductLandingPageListOptions): Promise<ListResponse<ProductLandingPage>> {
    const params: Record<string, any> = { ...options?.params }
    return super.list({ params })
  }

  /**
   * Lite orders report for a product landing page in a store.
   */
  async liteOrdersReport(
    storeId: string,
    landingPageId: string
  ): Promise<{ lor: LiteOrdersReport }> {
    const res = await this.client.get(
      `/stores/${storeId}/product_landing_pages/${landingPageId}/analytics/lor`
    )
    return res.data
  }
}
