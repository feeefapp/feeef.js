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

export interface OrderEntity {
  id: string
  customerName?: string | null
  customerPhone: string
  customerIp?: string | null
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingMethodId?: string | null
  paymentMethodId?: string | null
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
  discount: number
  coupon?: string | null
  storeId: string
  metadata: any
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
}

// order track entity
export interface OrderTrackEntity {
  id: string
  customerName?: string | null
  customerPhone: string
  customerIp?: string | null
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingState?: string | null
  shippingMethodId?: string | null
  paymentMethodId?: string | null
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
  discount: number
  coupon?: string | null
  storeId: string
  metadata: any
  status: OrderStatus
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  createdAt: any
  updatedAt: any
}
