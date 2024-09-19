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
}
