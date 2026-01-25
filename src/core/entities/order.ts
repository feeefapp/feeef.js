export enum OrderStatus {
  draft = 'draft',
  pending = 'pending',
  review = 'review',
  accepted = 'accepted',
  processing = 'processing',
  completed = 'completed',
  cancelled = 'cancelled',
}

// PaymentStatus
export enum PaymentStatus {
  unpaid = 'unpaid',
  paid = 'paid',
  received = 'received',
}
export enum DeliveryStatus {
  pending = 'pending',
  delivering = 'delivering',
  delivered = 'delivered',
  returned = 'returned',
}

export enum ShippingType {
  // delivery to customer home
  home = 'home',
  // the customer picks up the order from the local shipping center
  pickup = 'pickup',
  // the customer picks up the order from the store
  store = 'store',
}

export interface OrderEntity {
  id: string
  customerName?: string | null
  customerPhone: string
  customerEmail?: string | null
  customerNote?: string | null
  customerIp?: string | null
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingCountry?: string | null
  shippingMethodId?: string | null
  shippingType: ShippingType
  trackingCode: string | null
  paymentMethodId?: string | null
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
  discount: number
  // @Deprecated
  coupon?: string | null
  couponId?: string | null
  couponCode?: string | null
  couponDiscount?: string | null
  storeId: string
  source: string | null
  confirmerId: string | null
  customFields?: Record<string, any> | null
  metadata: OrderMetadata
  claims?: Record<string, any> | null // System-only, secure data storage (read-only for users)
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  customStatus?: string | null
  tags: string[] | null
  createdAt: any
  updatedAt: any
}
export interface OrderItem {
  productId: string
  productName: string
  productPhotoUrl?: string | null
  variantPath?: string
  sku?: string | null
  discount?: number | null
  quantity: number
  price: number
  offerCode?: string | null
  offerName?: string | null
  addons?: Record<string, number>
}

// order track entity
export interface OrderTrackEntity {
  id: string
  customerName?: string | null
  items: OrderItem[]
  total: number
  createdAt: any
  storeId: string
  status: OrderStatus
  history: OrderTrackHistory[]
}

// order track history
export interface OrderTrackHistory {
  status: OrderStatus
  deliveryStatus: string
  paymentStatus: string
  createdAt: string
}

// order metadata history
interface OrderMetadataHistory {
  status: OrderStatus
  deliveryStatus: string
  paymentStatus: string
  createdAt: string
  message: string
  code: string
  userId: string
}

// order metadata
interface OrderMetadata {
  note?: string
  history?: OrderMetadataHistory[]
  metaPixel?: any
  customOrderTagHistories?: any[]
  [key: string]: any
}

// utils
// order entity to order track entity
export const convertOrderEntityToOrderTrackEntity = (order: OrderEntity): OrderTrackEntity => {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items,
    total: order.total,
    createdAt: order.createdAt,
    storeId: order.storeId,
    status: order.status,
    history:
      order.metadata.history?.map((history) => ({
        status: history.status,
        deliveryStatus: history.deliveryStatus,
        paymentStatus: history.paymentStatus,
        createdAt: history.createdAt,
      })) || [],
  }
}

/**
 * Input for creating a new order (admin/merchant)
 */
export interface OrderCreateInput {
  id?: string
  customerName?: string
  customerPhone: string
  customerEmail?: string
  customerNote?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingType: ShippingType
  shippingMethodId?: string
  paymentMethodId?: string
  items: OrderItemInput[]
  coupon?: string
  couponId?: string
  source?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  deliveryStatus?: DeliveryStatus
  customStatus?: string
  customFields?: Record<string, any>
  metadata?: Record<string, any>
  storeId: string
  tags?: string[]
}

/**
 * Input for order items when creating/updating an order
 */
export interface OrderItemInput {
  productId: string
  quantity: number
  variantPath?: string
  offerCode?: string
  addons?: Record<string, number>
  price?: number
  discount?: number
}

/**
 * Input data for updating an existing order
 */
export interface OrderUpdateInput {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerNote?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingType?: ShippingType
  shippingMethodId?: string
  trackingCode?: string
  paymentMethodId?: string
  items?: OrderItemInput[]
  subtotal?: number
  shippingPrice?: number
  total?: number
  discount?: number
  coupon?: string
  couponId?: string
  source?: string
  confirmerId?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  deliveryStatus?: DeliveryStatus
  customStatus?: string
  customFields?: Record<string, any>
  metadata?: Record<string, any>
  tags?: string[]
}

/**
 * Order pricing calculation result
 */
export interface OrderPricing {
  subtotal: number
  shippingPrice: number | null
  calculatedTotal: number
}

/**
 * Options for calculating order pricing
 */
export interface CalculateOrderPricingOptions {
  storeId: string
  items: OrderItemInput[]
  shippingState?: string
  shippingCountry?: string
  shippingType?: ShippingType
  shippingAddress?: string
}
