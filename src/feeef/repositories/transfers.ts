import { AxiosInstance } from 'axios'
import { ModelRepository, ModelCreateOptions } from './repository.js'

/**
 * Represents a transfer entity for double-entry accounting transactions
 */
export interface TransferEntity {
  id: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  type:
    | 'deposit'
    | 'subscription'
    | 'points'
    | 'store_due'
    | 'user_transfer'
    | 'ai_generation'
    | 'refund'
    | 'adjustment'
  referenceId?: string | null
  description?: string | null
  metadata: Record<string, any>
  createdAt: any
}

/**
 * Input data for creating a new transfer
 */
export interface TransferCreateInput {
  debitAccountId: string
  creditAccountId: string
  amount: number
  type: TransferEntity['type']
  referenceId?: string | null
  description?: string | null
  metadata?: Record<string, any>
}

/**
 * Repository for managing transfer data
 */
export class TransferRepository extends ModelRepository<TransferEntity, TransferCreateInput, any> {
  /**
   * Constructs a new TransferRepository instance
   * @param client - The AxiosInstance used for making HTTP requests
   */
  constructor(client: AxiosInstance) {
    super('transfers', client)
  }

  // TypeScript method overloads for better type inference
  /**
   * Creates a new transfer with data directly.
   * @param data - The transfer data to create
   * @param params - Optional query parameters
   * @returns A promise that resolves to the created transfer entity
   */
  async create(data: TransferCreateInput, params?: Record<string, any>): Promise<TransferEntity>
  /**
   * Creates a new transfer with options object.
   * @param options - The options object containing data and optional params
   * @returns A promise that resolves to the created transfer entity
   */
  async create(options: ModelCreateOptions<TransferCreateInput>): Promise<TransferEntity>
  async create(
    dataOrOptions: TransferCreateInput | ModelCreateOptions<TransferCreateInput>,
    params?: Record<string, any>
  ): Promise<TransferEntity> {
    // If dataOrOptions is already wrapped in ModelCreateOptions, use it directly
    if (dataOrOptions && typeof dataOrOptions === 'object' && 'data' in dataOrOptions) {
      return super.create(dataOrOptions as ModelCreateOptions<TransferCreateInput>)
    }
    // Otherwise, wrap the data in ModelCreateOptions
    return super.create({ data: dataOrOptions as TransferCreateInput, params })
  }
}
