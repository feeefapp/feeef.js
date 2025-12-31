import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  OrderEntity,
  OrderTrackEntity,
  OrderStatus,
  DeliveryStatus,
  PaymentStatus,
  ShippingType,
  OrderCreateInput,
  OrderUpdateInput,
  OrderPricing,
  CalculateOrderPricingOptions,
} from '../../core/entities/order.js'

/**
 * Represents the options for tracking an order.
 */
export interface OrderModelTrackOptions {
  id: string
  params?: Record<string, any>
}

/**
 * Schema for sending an order from an anonymous user
 */
export interface SendOrderSchema {
  id?: string
  customerName?: string
  customerNote?: string
  customerPhone: string
  customerEmail?: string
  source?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingType: ShippingType
  shippingMethodId?: string
  shippingNote?: string
  paymentMethodId?: string
  items: GuestOrderItemSchema[]
  coupon?: string
  status: 'pending' | 'draft'
  storeId: string
  customFields?: Record<string, any>
  metadata?: any
}

/**
 * Schema for guest order items
 */
export interface GuestOrderItemSchema {
  productId: string
  offerCode?: string
  variantPath?: string
  quantity: number
  addons?: Record<string, number>
}

/**
 * Schema for assigning a single order to a member
 */
export interface AssignOrderSchema {
  orderId: string
  memberId: string
  storeId: string
}

/**
 * Schema for assigning multiple orders to a member
 */
export interface AssignManyOrdersSchema {
  orderIds: string[]
  memberId: string
  storeId: string
}

/**
 * Delivery service filter enum
 */
export enum DeliveryServiceFilter {
  yalidine = 'yalidine',
  ecotrack = 'ecotrack',
  procolis = 'procolis',
  noest = 'noest',
  zimou = 'zimou',
  maystro = 'maystro',
  ecomanager = 'ecomanager',
}

/**
 * Options for listing orders
 */
export interface OrderListOptions {
  page?: number
  offset?: number
  limit?: number
  storeId?: string
  status?: OrderStatus | OrderStatus[]
  deliveryStatus?: DeliveryStatus
  paymentStatus?: PaymentStatus
  customStatus?: string | string[]
  source?: string | string[]
  tags?: string[]
  createdBefore?: Date | string
  createdAfter?: Date | string
  q?: string
  confirmer?: string
  products?: string[]
  shippingState?: string
  shippingCity?: string
  deliveryService?: DeliveryServiceFilter
  params?: Record<string, any>
}

/**
 * Represents a repository for managing orders.
 */
export class OrderRepository extends ModelRepository<
  OrderEntity,
  OrderCreateInput,
  OrderUpdateInput
> {
  /**
   * Constructs a new OrderRepository instance.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('orders', client)
  }

  /**
   * Lists orders with optional filtering.
   * @param options - The options for listing orders.
   * @returns A Promise that resolves to a list of Order entities.
   */
  async list(options?: OrderListOptions): Promise<ListResponse<OrderEntity>> {
    const params: Record<string, any> = { ...options?.params }

    if (options) {
      if (options.page) params.page = options.page
      if (options.offset) params.offset = options.offset
      if (options.limit) params.limit = options.limit
      if (options.storeId) params.store_id = options.storeId
      if (options.status) {
        params.status = Array.isArray(options.status) ? options.status : [options.status]
      }
      if (options.deliveryStatus) params.deliveryStatus = options.deliveryStatus
      if (options.paymentStatus) params.paymentStatus = options.paymentStatus
      if (options.customStatus) params.customStatus = options.customStatus
      if (options.source) params.source = options.source
      if (options.tags) params.tags = options.tags
      if (options.createdBefore) {
        params.created_before =
          options.createdBefore instanceof Date
            ? options.createdBefore.toISOString()
            : options.createdBefore
      }
      if (options.createdAfter) {
        params.created_after =
          options.createdAfter instanceof Date
            ? options.createdAfter.toISOString()
            : options.createdAfter
      }
      if (options.q) params.q = options.q
      if (options.confirmer) params.confirmer = options.confirmer
      if (options.products) params.products = options.products
      if (options.shippingState) params.shippingState = options.shippingState
      if (options.shippingCity) params.shippingCity = options.shippingCity
      if (options.deliveryService) params.deliveryService = options.deliveryService
    }

    return super.list({ params })
  }

  /**
   * Sends an order from an anonymous user.
   * @param data - The data representing the order to be sent.
   * @returns A Promise that resolves to the sent OrderEntity.
   */
  async send(data: SendOrderSchema): Promise<OrderEntity> {
    const res = await this.client.post(`/${this.resource}/send`, data)
    return res.data
  }

  /**
   * Tracks the order by the order ID.
   * Returns the order status and history.
   * @param options - The options for tracking the order.
   * @returns A promise that resolves to the order track entity.
   */
  async track(options: OrderModelTrackOptions): Promise<OrderTrackEntity> {
    const { id, params } = options
    const res = await this.client.get(`/${this.resource}/${id}/track`, {
      params,
    })
    return res.data
  }

  /**
   * Calculates order pricing based on items, shipping details, etc.
   * @param options - The calculation options.
   * @returns A Promise that resolves to the calculated pricing.
   */
  async calculate(options: CalculateOrderPricingOptions): Promise<OrderPricing> {
    const res = await this.client.post(`/${this.resource}/calculate`, {
      storeId: options.storeId,
      items: options.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantPath: item.variantPath,
        offerCode: item.offerCode,
        addons: item.addons,
        price: item.price,
        discount: item.discount,
      })),
      shippingState: options.shippingState,
      shippingCountry: options.shippingCountry,
      shippingType: options.shippingType,
      shippingAddress: options.shippingAddress,
    })

    return {
      subtotal: res.data.pricing.subtotal,
      shippingPrice: res.data.pricing.shippingPrice,
      calculatedTotal: res.data.pricing.calculatedTotal,
    }
  }

  /**
   * Assigns a single order to a member (as confirmer).
   * @param data - The data containing orderId, memberId, and storeId.
   * @returns A Promise that resolves to the updated OrderEntity.
   */
  async assign(data: AssignOrderSchema): Promise<OrderEntity> {
    const res = await this.client.post(`/${this.resource}/assign`, data)
    return res.data
  }

  /**
   * Assigns multiple orders to a member (as confirmer).
   * @param data - The data containing orderIds, memberId, and storeId.
   * @returns A Promise that resolves to a success message.
   */
  async assignMany(data: AssignManyOrdersSchema): Promise<{ message: string }> {
    const res = await this.client.post(`/${this.resource}/assignMany`, data)
    return res.data
  }
}
