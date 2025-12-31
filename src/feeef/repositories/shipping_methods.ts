import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  ShippingMethodEntity,
  ShippingMethodCreateInput,
  ShippingMethodUpdateInput,
  ShippingMethodStatus,
  ShippingMethodPolicy,
} from '../../core/entities/shipping_method.js'

/**
 * Options for listing shipping methods
 */
export interface ShippingMethodListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  status?: ShippingMethodStatus | ShippingMethodStatus[]
  policy?: ShippingMethodPolicy
  params?: Record<string, any>
}

/**
 * Repository for managing ShippingMethod entities.
 */
export class ShippingMethodRepository extends ModelRepository<
  ShippingMethodEntity,
  ShippingMethodCreateInput,
  ShippingMethodUpdateInput
> {
  /**
   * Constructs a new ShippingMethodRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('shipping_methods', client)
  }

  /**
   * Lists shipping methods with optional filtering.
   * @param options - The options for listing shipping methods.
   * @returns A Promise that resolves to a list of ShippingMethod entities.
   */
  async list(options?: ShippingMethodListOptions): Promise<ListResponse<ShippingMethodEntity>> {
    const { storeId, status, policy, ...listOptions } = options || {}

    const params: Record<string, any> = {
      ...listOptions.params,
    }

    if (storeId) params.store_id = storeId
    if (status) params.status = Array.isArray(status) ? status : [status]
    if (policy) params.policy = policy

    return super.list({
      ...listOptions,
      params,
    })
  }

  /**
   * Lists shipping methods for a specific store.
   * @param storeId - The store ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of ShippingMethod entities.
   */
  async listByStore(
    storeId: string,
    options?: Omit<ShippingMethodListOptions, 'storeId'>
  ): Promise<ListResponse<ShippingMethodEntity>> {
    return this.list({ ...options, storeId })
  }
}
