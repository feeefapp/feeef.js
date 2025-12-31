import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  ProductEntity,
  ProductCreateInput,
  ProductUpdateInput,
  ProductReport,
  ProductStatus,
} from '../../core/entities/product.js'

/**
 * Options for listing products
 */
export interface ProductListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  categoryId?: string
  status?: ProductStatus | ProductStatus[]
  q?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: 'price' | 'createdAt' | 'sold' | 'views'
  sortOrder?: 'asc' | 'desc'
  params?: Record<string, any>
}

/**
 * Represents a repository for managing products.
 */
export class ProductRepository extends ModelRepository<
  ProductEntity,
  ProductCreateInput,
  ProductUpdateInput
> {
  /**
   * Creates a new instance of the ProductRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('products', client)
  }

  /**
   * Lists products with optional filtering.
   * @param options - The options for listing products.
   * @returns A Promise that resolves to a list of Product entities.
   */
  async list(options?: ProductListOptions): Promise<ListResponse<ProductEntity>> {
    const {
      storeId,
      categoryId,
      status,
      q,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      ...listOptions
    } = options || {}

    const params: Record<string, any> = {
      ...listOptions.params,
    }

    if (storeId) params.store_id = storeId
    if (categoryId) params.category_id = categoryId
    if (status) params.status = Array.isArray(status) ? status : [status]
    if (q) params.q = q
    if (minPrice !== undefined) params.min_price = minPrice
    if (maxPrice !== undefined) params.max_price = maxPrice
    if (inStock !== undefined) params.in_stock = inStock
    if (sortBy) params.sort_by = sortBy
    if (sortOrder) params.sort_order = sortOrder

    return super.list({
      ...listOptions,
      params,
    })
  }

  /**
   * Retrieves random products from the repository.
   * @param limit - The number of random products to retrieve. Default is 12.
   * @returns A promise that resolves to an array of random ProductEntity objects.
   */
  async random(limit = 12): Promise<ProductEntity[]> {
    const response = await this.client.get<ProductEntity[]>(`/products/random`, {
      params: { limit },
    })
    return response.data
  }

  /**
   * Gets the sells chart for a product (last 7 days).
   * @param productId - The product ID.
   * @param storeId - The store ID.
   * @returns A Promise that resolves to a map of date to number of sells.
   */
  async sells(productId: string, storeId: string): Promise<Map<Date, number>> {
    const res = await this.client.get(`/stores/${storeId}/${this.resource}/${productId}/sells`)
    const sellsData = new Map<Date, number>()

    if (res.data) {
      for (const [key, value] of Object.entries(res.data)) {
        sellsData.set(new Date(key), Number(value) || 0)
      }
    }

    return sellsData
  }

  /**
   * Gets the analytics/report for a product.
   * @param productId - The product ID.
   * @param storeId - The store ID.
   * @returns A Promise that resolves to the product report.
   */
  async report(productId: string, storeId: string): Promise<ProductReport> {
    const res = await this.client.get(`/stores/${storeId}/${this.resource}/${productId}/report`)
    return res.data
  }
}
