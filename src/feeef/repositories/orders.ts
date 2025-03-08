import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { OrderEntity, OrderTrackEntity, ShippingType } from '../../core/entities/order.js'
/**
 * Represents the options for tracking an order.
 */
export interface OrderModelTrackOptions {
  id: string
  params?: Record<string, any>
}

export interface SendOrderSchema {
  id?: string // Order ID (optional)
  customerName?: string // Name of the customer (optional)
  customerNote?: string // Note from the customer (optional)
  customerPhone: string // Customer's phone number (required)
  source?: string // the source of the order (facebook...tiktok..)
  shippingAddress?: string // Address for shipping (optional)
  shippingCity?: string // City for shipping (optional)
  shippingState?: string // State for shipping (optional)
  shippingType: ShippingType // Shipping type (required)
  shippingMethodId?: string // ID of the shipping method (optional)
  paymentMethodId?: string // ID of the payment method (optional)
  items: GuestOrderItemSchema[] // Array of order items, must have at least one item
  coupon?: string // Applied coupon code (optional)
  status: 'pending' | 'draft' // Order status (required)
  storeId: string // ID of the store (required)
  metadata?: any // Additional metadata (optional)
}

// Assuming GuestOrderItemSchema was defined elsewhere, define it here as well if needed.
export interface GuestOrderItemSchema {
  productId: string
  offerCode?: string
  variantPath?: string
  quantity: number
  addons?: Record<string, number>
}

/**
 * Represents a repository for managing orders.
 */
export class OrderRepository extends ModelRepository<OrderEntity, any, any> {
  /**
   * Constructs a new OrderRepository instance.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('orders', client)
  }

  /**
   * Sends an order from an anonymous user.
   * @param data - The data representing the order to be sent.
   * @returns A Promise that resolves to the sent OrderEntity.
   */
  async send(data: SendOrderSchema): Promise<OrderEntity> {
    const output = data
    const res = await this.client.post(`/${this.resource}/send`, output)

    // Return the sent OrderEntity
    return res.data
  }

  /**
   * track the order by the order id
   * it will return the order status and history
   * @param options - The options for finding the model.
   * @returns A promise that resolves to the found model.
   */
  async track(options: OrderModelTrackOptions): Promise<OrderTrackEntity> {
    const { id, params } = options
    const res = await this.client.get(`/${this.resource}/${id}/track`, {
      params: {
        ...params,
      },
    })
    return res.data
  }
}
