import { AxiosInstance } from 'axios'
import { ModelRepository, ModelCreateOptions } from './repository.js'

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
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
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
  amount: number
  currency?: string
  paymentMethod?: string
  attachment?: string
  note?: string
  metadata?: Record<string, any>
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
 * Repository for managing deposit data and PayPal integration
 */
export class DepositRepository extends ModelRepository<DepositEntity, DepositCreateInput, any> {
  /**
   * Constructs a new DepositRepository instance
   * @param client - The AxiosInstance used for making HTTP requests
   */
  constructor(client: AxiosInstance) {
    super('deposits', client)
  }

  // TypeScript method overloads for better type inference
  /**
   * Creates a new deposit with data directly.
   * @param data - The deposit data to create
   * @param params - Optional query parameters
   * @returns A promise that resolves to the created deposit entity
   */
  async create(data: DepositCreateInput, params?: Record<string, any>): Promise<DepositEntity>
  /**
   * Creates a new deposit with options object.
   * @param options - The options object containing data and optional params
   * @returns A promise that resolves to the created deposit entity
   */
  async create(options: ModelCreateOptions<DepositCreateInput>): Promise<DepositEntity>
  async create(
    dataOrOptions: DepositCreateInput | ModelCreateOptions<DepositCreateInput>,
    params?: Record<string, any>
  ): Promise<DepositEntity> {
    // If dataOrOptions is already wrapped in ModelCreateOptions, use it directly
    if (dataOrOptions && typeof dataOrOptions === 'object' && 'data' in dataOrOptions) {
      return super.create(dataOrOptions as ModelCreateOptions<DepositCreateInput>)
    }
    // Otherwise, wrap the data in ModelCreateOptions
    return super.create({ data: dataOrOptions as DepositCreateInput, params })
  }

  /**
   * Create a new deposit request
   * @param data - The deposit data
   * @returns Promise that resolves to the created deposit
   */
  async send(data: DepositCreateInput): Promise<DepositEntity> {
    const output = data
    const res = await this.client.post(`/${this.resource}/send`, output)
    return res.data
  }

  /**
   * Create a PayPal order for deposit
   * @param params - PayPal order parameters
   * @returns Promise that resolves to PayPal order details
   */
  async createPayPalOrder(params: {
    amount: number
    currency?: string
    depositId?: string
    returnUrl: string
    cancelUrl: string
  }): Promise<PayPalOrderResponse> {
    const orderData = {
      amount: params.amount,
      currency: params.currency || 'USD',
      depositId: params.depositId,
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
    }

    const res = await this.client.post(`/${this.resource}/paypal/create-order`, orderData)

    // Extract approval URL from links
    const approvalLink = res.data.links?.find((link: any) => link.rel === 'approve')

    return {
      id: res.data.id,
      status: res.data.status,
      approvalUrl: approvalLink?.href,
      links: res.data.links || [],
    }
  }

  /**
   * Capture a PayPal order after user approval
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
}
