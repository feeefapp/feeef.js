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
  /** Deliver to the customer's address (maps to shipping price `home`). */
  home = 'home',
  /**
   * Stopdesk / carrier relay office in the region (not merchant store).
   * Maps to shipping price key `desk`.
   */
  pickup = 'pickup',
  /** Customer collects at the merchant's store branch. Maps to shipping price key `pickup`. */
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
  /**
   * Attribution tokens: `product:…`, `product_landing_page:…`.
   * JSON / API field name is always **`references`** (never `orderReferences`).
   */
  references?: string[]
  createdAt: any
  updatedAt: any
}

/** Lite orders report (8 UTC days + total), API key `lor`. */
export interface LiteOrdersReport {
  lastSync: string
  lastItemDate: string
  totalOrders: number
  data: [number, number, number][]
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
  references?: string[]
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
  references?: string[]
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

// ===================== SECURITY HELPERS =====================

/**
 * Check if an order ID indicates a fake/honeypot order
 * Fake orders use the "FuHe3nf" prefix
 */
export function isFakeOrderId(orderId: string | undefined | null): boolean {
  return !!orderId && orderId.startsWith('FuHe3nf')
}

/**
 * Check if an order is a fake order (by ID or metadata flag)
 */
export function isFakeOrder(order: OrderEntity): boolean {
  return isFakeOrderId(order.id) || order.metadata?._fake === true
}

/**
 * Check if an order has warning treatment (created but flagged)
 */
export function isWarningOrder(order: OrderEntity): boolean {
  return order.claims?.security?.treatment === 'warning'
}

/**
 * Check if pixel events should be suppressed for this order
 * Suppress for: fake orders, warning treatment, fake treatment
 */
export function shouldSuppressPixelEvents(order: OrderEntity): boolean {
  if (isFakeOrder(order)) return true
  const treatment = order.claims?.security?.treatment
  return treatment === 'warning' || treatment === 'fake'
}
