import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'
import { AxiosInstance } from 'axios'
import { StoreEntity } from '../../core/core.js'
import { CreateUserStoreSchema, UpdateUserStoreSchema } from '../validators/user_stores.js'
import { ModelRepository, ModelCreateOptions } from './repository.js'

/**
 * Repository for managing Store entities.
 */
export class StoreRepository extends ModelRepository<
  StoreEntity,
  InferInput<typeof CreateUserStoreSchema>,
  InferInput<typeof UpdateUserStoreSchema>
> {
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
  async create(
    options: ModelCreateOptions<InferInput<typeof CreateUserStoreSchema>>
  ): Promise<StoreEntity> {
    const validator = vine.compile(CreateUserStoreSchema)
    const output = await validator.validate(options.data)
    return super.create({ ...options, data: output })
  }
}
