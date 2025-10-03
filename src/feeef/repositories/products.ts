import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { ProductEntity } from '../../core/entities/product.js'

/**
 * Represents a repository for managing products.
 */
export class ProductRepository extends ModelRepository<ProductEntity, any, any> {
  /**
   * Creates a new instance of the ProductRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('products', client)
  }

  /**
   * Retrieves a random products from the repository.
   * @param limit - The number of random products to retrieve. Default is 1.
   * @returns A promise that resolves to an array of random ProductEntity objects.
   */
  async random(limit = 12): Promise<ProductEntity[]> {
    const response = await this.client.get<ProductEntity[]>(`/products/random`, {
      params: { limit },
    })
    return response.data
  }
}
