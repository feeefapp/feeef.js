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
  home = 'home',
  pickup = 'pickup',
  store = 'store',
}

export interface OrderEntity {
  id: string
  customerName?: string | null
  customerPhone: string
  customerIp?: string | null
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingMethodId?: string | null
  shippingType: ShippingType
  paymentMethodId?: string | null
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
  discount: number
  coupon?: string | null
  storeId: string
  metadata: OrderMetadata
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  createdAt: any
  updatedAt: any
}
export interface OrderItem {
  productId: string
  productName: string
  productPhotoUrl?: string | null
  variantPath?: string
  quantity: number
  price: number
  offerCode?: string | null
  offerName?: string | null
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
