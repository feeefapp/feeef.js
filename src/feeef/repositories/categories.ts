import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  CategoryEntity,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../../core/entities/category.js'

/**
 * Options for listing categories
 */
export interface CategoryListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  parentId?: string | null
  q?: string
  params?: Record<string, any>
}

/**
 * Represents a repository for managing categories.
 */
export class CategoryRepository extends ModelRepository<
  CategoryEntity,
  CategoryCreateInput,
  CategoryUpdateInput
> {
  /**
   * Creates a new instance of the CategoryRepository class.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('categories', client)
  }

  /**
   * Lists categories with optional filtering.
   * @param options - The options for listing categories.
   * @returns A Promise that resolves to a list of Category entities.
   */
  async list(options?: CategoryListOptions): Promise<ListResponse<CategoryEntity>> {
    const { storeId, parentId, q, ...listOptions } = options || {}

    const params: Record<string, any> = {
      ...listOptions.params,
    }

    if (storeId) params.store_id = storeId
    if (parentId !== undefined) params.parent_id = parentId
    if (q) params.q = q

    return super.list({
      ...listOptions,
      params,
    })
  }

  /**
   * Lists categories for a specific store.
   * @param storeId - The store ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of Category entities.
   */
  async listByStore(
    storeId: string,
    options?: Omit<CategoryListOptions, 'storeId'>
  ): Promise<ListResponse<CategoryEntity>> {
    return this.list({ ...options, storeId })
  }

  /**
   * Lists root categories (no parent) for a store.
   * @param storeId - The store ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of root Category entities.
   */
  async listRootCategories(
    storeId: string,
    options?: Omit<CategoryListOptions, 'storeId' | 'parentId'>
  ): Promise<ListResponse<CategoryEntity>> {
    return this.list({ ...options, storeId, parentId: null })
  }

  /**
   * Lists child categories for a parent category.
   * @param storeId - The store ID.
   * @param parentId - The parent category ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of child Category entities.
   */
  async listChildren(
    storeId: string,
    parentId: string,
    options?: Omit<CategoryListOptions, 'storeId' | 'parentId'>
  ): Promise<ListResponse<CategoryEntity>> {
    return this.list({ ...options, storeId, parentId })
  }
}
