import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'

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
}
