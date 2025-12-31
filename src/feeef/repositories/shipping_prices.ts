import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  ShippingPriceEntity,
  ShippingPriceCreateInput,
  ShippingPriceUpdateInput,
  ShippingPriceStatus,
} from '../../core/entities/shipping_price.js'

/**
 * Options for listing shipping prices
 */
export interface ShippingPriceListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  status?: ShippingPriceStatus | ShippingPriceStatus[]
  params?: Record<string, any>
}

/**
 * Repository for managing ShippingPrice entities.
 *
 * ShippingPrice is the new geo-based shipping system that replaces
 * the legacy array-based ShippingMethod rates.
 */
export class ShippingPriceRepository extends ModelRepository<
  ShippingPriceEntity,
  ShippingPriceCreateInput,
  ShippingPriceUpdateInput
> {
  /**
   * Constructs a new ShippingPriceRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('shipping_prices', client)
  }

  /**
   * Lists shipping prices with optional filtering.
   * @param options - The options for listing shipping prices.
   * @returns A Promise that resolves to a list of ShippingPrice entities.
   */
  async list(options?: ShippingPriceListOptions): Promise<ListResponse<ShippingPriceEntity>> {
    const { storeId, status, ...listOptions } = options || {}

    const params: Record<string, any> = {
      ...listOptions.params,
    }

    if (storeId) params.store_id = storeId
    if (status) params.status = Array.isArray(status) ? status : [status]

    return super.list({
      ...listOptions,
      params,
    })
  }

  /**
   * Lists shipping prices for a specific store.
   * @param storeId The store ID to search for.
   * @returns A Promise that resolves to the ShippingPrice entities for the store.
   */
  async listByStore(storeId: string): Promise<ShippingPriceEntity[]> {
    const response = await this.list({ storeId })
    return response.data
  }
}
