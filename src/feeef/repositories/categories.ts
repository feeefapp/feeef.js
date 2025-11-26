import { AxiosInstance } from 'axios'
import { ModelRepository, ModelCreateOptions, ModelListOptions } from './repository.js'
import { CategoryEntity } from '../../core/entities/category.js'

export interface CategoryCreate {
  store_id: string
  parent_id?: string | null
  name: string
  description?: string | null
  photo_url?: string | null
  metadata?: Record<string, any>
}

export interface CategoryUpdate {
  parent_id?: string | null
  name?: string
  description?: string | null
  photo_url?: string | null
  metadata?: Record<string, any>
}

/**
 * Repository for managing Category entities.
 */
export class CategoryRepository extends ModelRepository<
  CategoryEntity,
  CategoryCreate,
  CategoryUpdate
> {
  /**
   * Constructs a new CategoryRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('categories', client)
  }

  /**
   * Lists categories for a store with optional parent filter.
   * @param options The options for listing categories.
   * @returns A Promise that resolves to a list of categories.
   */
  async list(
    options?: ModelListOptions & { storeId?: string; parentId?: string | null }
  ): Promise<any> {
    const { storeId, parentId, ...listOptions } = options || {}
    const params = {
      ...listOptions.params,
      ...(storeId ? { store_id: storeId } : {}),
      ...(parentId !== undefined ? { parent_id: parentId } : {}),
    }
    return super.list({ ...listOptions, params })
  }

  /**
   * Gets the category tree structure for a store.
   * @param storeId The store ID.
   * @returns A Promise that resolves to the category tree.
   */
  async tree(storeId: string): Promise<CategoryEntity[]> {
    const res = await this.client.get(`/stores/${storeId}/categories/tree`)
    return res.data
  }

  /**
   * Creates a new Category entity.
   * @param options The options for creating the Category entity.
   * @returns A Promise that resolves to the created Category entity.
   */
  async create(
    options: ModelCreateOptions<CategoryCreate> & { storeId?: string }
  ): Promise<CategoryEntity> {
    const { storeId, data, ...rest } = options
    if (storeId) {
      const res = await this.client.post(`/stores/${storeId}/categories`, data, {
        params: rest.params,
      })
      return res.data
    }
    return super.create(options)
  }
}

