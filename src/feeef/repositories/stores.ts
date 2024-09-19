import { AxiosInstance } from 'axios'
import { ModelRepository, ModelCreateOptions } from './repository.js'
import { StoreEntity } from '../../core/entities/store.js'

/**
 * Repository for managing Store entities.
 */
export class StoreRepository extends ModelRepository<StoreEntity, any, any> {
  /**
   * Constructs a new StoreRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('stores', client)
  }

  /**
   * Creates a new Store entity.
   * @param options The options for creating the Store entity.
   * @returns A Promise that resolves to the created Store entity.
   */
  async create(options: ModelCreateOptions<any>): Promise<StoreEntity> {
    const output = options.data
    return super.create({ ...options, data: output })
  }
}
