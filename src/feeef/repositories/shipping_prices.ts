import { AxiosInstance } from 'axios'
import { ModelRepository, ModelCreateOptions } from './repository.js'
import { ShippingPriceEntity } from '../../core/entities/shipping_price.js'

/**
 * Repository for managing ShippingPrice entities.
 *
 * ShippingPrice is the new geo-based shipping system that replaces
 * the legacy array-based ShippingMethod rates.
 */
export class ShippingPriceRepository extends ModelRepository<ShippingPriceEntity, any, any> {
  /**
   * Constructs a new ShippingPriceRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('shipping_prices', client)
  }

  /**
   * Creates a new ShippingPrice entity.
   * @param options The options for creating the ShippingPrice entity.
   * @returns A Promise that resolves to the created ShippingPrice entity.
   */
  async create(options: ModelCreateOptions<any>): Promise<ShippingPriceEntity> {
    const output = options.data
    return super.create({ ...options, data: output })
  }

  /**
   * Finds a ShippingPrice by store ID.
   * @param storeId The store ID to search for.
   * @returns A Promise that resolves to the ShippingPrice entities for the store.
   */
  async listByStore(storeId: string): Promise<ShippingPriceEntity[]> {
    const response = await this.list({ params: { storeId } })
    return response.data
  }
}
