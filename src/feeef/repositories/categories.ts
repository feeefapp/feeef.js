import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { CategoryEntity } from '../../core/entities/category.js'

/**
 * Represents a repository for managing categories.
 */
export class CategoryRepository extends ModelRepository<CategoryEntity, any, any> {
  /**
   * Creates a new instance of the CategoryRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('categories', client)
  }
}
