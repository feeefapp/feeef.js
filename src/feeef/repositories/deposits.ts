import { type AxiosInstance } from 'axios'
import { ModelRepository, type ListResponse } from './repository.js'

/**
 * Deposit status enum
 */
export type DepositStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

/**
 * Represents a deposit entity for wallet transactions
 */
export interface DepositEntity {
  id: string
  externalId?: string | null
  userId: string
  amount: number
  currency: string
  paymentMethod?: string | null
  attachment?: string | null
  status: DepositStatus
  note?: string | null
  metadata: Record<string, any>
  history: Array<{
    status: string
    timestamp: string
    note?: string
  }>
  createdAt: any
  updatedAt: any
}

/**
 * Input data for creating a new deposit
 */
export interface DepositCreateInput {
  id?: string
  externalId?: string
  userId?: string
  amount: number
  currency?: string
  paymentMethod?: string
  attachment?: string
  status?: DepositStatus
  note?: string
  metadata?: Record<string, any>
}

/**
 * Input data for updating an existing deposit
 */
export interface DepositUpdateInput {
  externalId?: string
  amount?: number
  currency?: string
  paymentMethod?: string
  attachment?: string
  status?: DepositStatus
  note?: string
  metadata?: Record<string, any>
}

/**
 * Options for listing deposits
 */
export interface DepositListOptions {
  page?: number
  offset?: number
  limit?: number
  userId?: string
  status?: DepositStatus | DepositStatus[]
  paymentMethod?: string
  createdAfter?: Date | string
  createdBefore?: Date | string
  minAmount?: number
  maxAmount?: number
  q?: string
  params?: Record<string, any>
}

/**
 * PayPal order creation response
 */
export interface PayPalOrderResponse {
  id: string
  status: string
  approvalUrl?: string
  links: Array<{
    href: string
    rel: string
    method: string
  }>
}

/**
 * PayPal order capture response
 */
export interface PayPalCaptureResponse {
  id: string
  status: string
  captureId?: string
  amount?: number
  currency?: string
}

/**
 * Legacy deposit history (read) + admin review of in-flight legacy deposits.
 *
 * Wallet top-ups are Feeef Cloud deposits: use `ff.cloudWallet.topUp()`. A merchant
 * `create` returns `410 WALLET_ON_CLOUD`; only admins can still create rows here.
 */
export class DepositRepository extends ModelRepository<
  DepositEntity,
  DepositCreateInput,
  DepositUpdateInput
> {
  /**
   * Constructs a new DepositRepository instance
   * @param client - The AxiosInstance used for making HTTP requests
   */
  constructor(client: AxiosInstance) {
    super('deposits', client)
  }

  /**
   * Lists deposits with optional filtering.
   * @param options - The options for listing deposits.
   * @returns A Promise that resolves to a list of Deposit entities.
   */
  async list(options?: DepositListOptions): Promise<ListResponse<DepositEntity>> {
    const params: Record<string, any> = { ...options?.params }

    if (options) {
      if (options.page) params.page = options.page
      if (options.offset) params.offset = options.offset
      if (options.limit) params.limit = options.limit
      if (options.userId) params.user_id = options.userId
      if (options.status) {
        params.status = Array.isArray(options.status) ? options.status : [options.status]
      }
      if (options.paymentMethod) params.payment_method = options.paymentMethod
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
      if (options.q) params.q = options.q
    }

    return super.list({ params })
  }

  /**
   * Capture a PayPal order after user approval (in-flight legacy orders only)
   * @param orderId - PayPal order ID
   * @returns Promise that resolves to capture details
   */
  async capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
    const res = await this.client.post(`/${this.resource}/paypal/capture-order`, {
      orderId,
    })
    return res.data
  }

  /**
   * Get PayPal order status
   * @param orderId - PayPal order ID
   * @returns Promise that resolves to order details
   */
  async getPayPalOrderStatus(orderId: string): Promise<{
    id: string
    status: string
    amount?: number
    currency?: string
  }> {
    const res = await this.client.get(`/${this.resource}/paypal/order/${orderId}`)
    return res.data
  }

  /**
   * Accept a pending deposit (admin only)
   * @param depositId - The deposit ID to accept
   * @param note - Optional note for the status change
   * @returns Promise that resolves to the updated deposit
   */
  async accept(depositId: string, note?: string): Promise<DepositEntity> {
    return this.update({
      id: depositId,
      data: {
        status: 'completed',
        note,
      },
    })
  }

  /**
   * Reject a pending deposit (admin only)
   * @param depositId - The deposit ID to reject
   * @param note - Optional note for the rejection reason
   * @returns Promise that resolves to the updated deposit
   */
  async reject(depositId: string, note?: string): Promise<DepositEntity> {
    return this.update({
      id: depositId,
      data: {
        status: 'failed',
        note,
      },
    })
  }

  /**
   * Cancel a pending deposit
   * @param depositId - The deposit ID to cancel
   * @param note - Optional note for the cancellation reason
   * @returns Promise that resolves to the updated deposit
   */
  async cancel(depositId: string, note?: string): Promise<DepositEntity> {
    return this.update({
      id: depositId,
      data: {
        status: 'cancelled',
        note,
      },
    })
  }
}
