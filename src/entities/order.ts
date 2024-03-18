import { ShippingMethodEntity } from "./shipping_method";
import { StoreEntity } from "./store";

export interface OrderEntity {
  id: string;
  customerName: string | null;
  customerPhone: string;
  customerIp: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingMethodId: string | null;
  paymentMethodId: string | null;
  items: OrderItem[];
  subtotal: number;
  shippingPrice: number;
  total: number;
  discount: number;
  coupon: string | null;
  storeId: string;
  metadata: any;
  status: OrderStatus;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: any;
  updatedAt: any;
  store: StoreEntity | null;
  shippingMethod: ShippingMethodEntity | null;
}
export interface OrderItem {
  productId: string;
  variantPath?: string;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  draft = "draft",
  pending = "pending",
  processing = "processing",
  shipped = "shipped",
  delivering = "delivering",
  delivered = "delivered",
  cancelled = "cancelled",
  returned = "returned",
  refunded = "refunded",
}
