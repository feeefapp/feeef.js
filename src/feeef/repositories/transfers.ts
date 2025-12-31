import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'

/**
 * Transfer type enum
 */
export type TransferType =
  | 'deposit'
  | 'subscription'
  | 'points'
  | 'store_due'
  | 'user_transfer'
  | 'ai_generation'
  | 'refund'
  | 'adjustment'

/**
 * Represents a transfer entity for double-entry accounting transactions
 */
export interface TransferEntity {
  id: string
  debitAccountId: string
  creditAccountId: string
  amount: number
  type: TransferType
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
  type: TransferType
  referenceId?: string | null
  description?: string | null
  metadata?: Record<string, any>
}

/**
 * Input data for updating an existing transfer
 * Note: Transfers are typically immutable, but metadata/description may be updatable
 */
export interface TransferUpdateInput {
  description?: string | null
  metadata?: Record<string, any>
}

/**
 * Options for listing transfers
 */
export interface TransferListOptions {
  page?: number
  offset?: number
  limit?: number
  debitAccountId?: string
  creditAccountId?: string
  accountId?: string // Either debit or credit
  type?: TransferType | TransferType[]
  referenceId?: string
  createdAfter?: Date | string
  createdBefore?: Date | string
  minAmount?: number
  maxAmount?: number
  params?: Record<string, any>
}

/**
 * Repository for managing transfer data
 */
export class TransferRepository extends ModelRepository<
  TransferEntity,
  TransferCreateInput,
  TransferUpdateInput
> {
  /**
   * Constructs a new TransferRepository instance
   * @param client - The AxiosInstance used for making HTTP requests
   */
  constructor(client: AxiosInstance) {
    super('transfers', client)
  }

  /**
   * Lists transfers with optional filtering.
   * @param options - The options for listing transfers.
   * @returns A Promise that resolves to a list of Transfer entities.
   */
  async list(options?: TransferListOptions): Promise<ListResponse<TransferEntity>> {
    const params: Record<string, any> = { ...options?.params }

    if (options) {
      if (options.page) params.page = options.page
      if (options.offset) params.offset = options.offset
      if (options.limit) params.limit = options.limit
      if (options.debitAccountId) params.debit_account_id = options.debitAccountId
      if (options.creditAccountId) params.credit_account_id = options.creditAccountId
      if (options.accountId) params.account_id = options.accountId
      if (options.type) {
        params.type = Array.isArray(options.type) ? options.type : [options.type]
      }
      if (options.referenceId) params.reference_id = options.referenceId
      if (options.createdAfter) {
        params.created_after =
          options.createdAfter instanceof Date
            ? options.createdAfter.toISOString()
            : options.createdAfter
      }
      if (options.createdBefore) {
        params.created_before =
          options.createdBefore instanceof Date
            ? options.createdBefore.toISOString()
            : options.createdBefore
      }
      if (options.minAmount !== undefined) params.min_amount = options.minAmount
      if (options.maxAmount !== undefined) params.max_amount = options.maxAmount
    }

    return super.list({ params })
  }

  /**
   * Lists transfers for a specific account (either as debit or credit).
   * @param accountId - The account ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of Transfer entities.
   */
  async listByAccount(
    accountId: string,
    options?: Omit<TransferListOptions, 'accountId'>
  ): Promise<ListResponse<TransferEntity>> {
    return this.list({ ...options, accountId })
  }

  /**
   * Lists transfers by type.
   * @param type - The transfer type(s).
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of Transfer entities.
   */
  async listByType(
    type: TransferType | TransferType[],
    options?: Omit<TransferListOptions, 'type'>
  ): Promise<ListResponse<TransferEntity>> {
    return this.list({ ...options, type })
  }

  /**
   * Lists transfers by reference ID.
   * @param referenceId - The reference ID.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of Transfer entities.
   */
  async listByReferenceId(
    referenceId: string,
    options?: Omit<TransferListOptions, 'referenceId'>
  ): Promise<ListResponse<TransferEntity>> {
    return this.list({ ...options, referenceId })
  }
}
