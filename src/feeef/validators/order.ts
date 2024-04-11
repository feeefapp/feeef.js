// import { OrderStatus } from '#core/core'
import vine from "@vinejs/vine";
import { PhoneShema } from "./auth.js";
import { OrderStatus } from "../../core/core.js";

export const OrderItemSchema = vine.object({
  productId: vine.string(),
  // productId: vine.string().exists(async (db, value, field) => {
  //   const product = await db.from('products').where('id', value).first()
  //   return !!product
  // }),
  productName: vine.string().optional(),
  variant: vine.any().optional(),
  quantity: vine.number(),
  price: vine.number().optional(),
});

export const GuestOrderItemSchema = vine.object({
  productId: vine.string(),
  variantPath: vine.string().optional(),
  quantity: vine.number(),
});

export const SendOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerPhone: vine.string(),
  //   customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(GuestOrderItemSchema).minLength(1),
  //   subtotal: vine.number().optional(),
  //   shippingPrice: vine.number().optional(),
  //   total: vine.number().optional(),
  //   discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(["pending", "draft"]),
  // TODO: validate storeId is exists and not blocked
  storeId: vine.string(),
  metadata: vine.any().optional(),
});

/// store owner section
// CreateOrderSchema
export const CreateOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerPhone: PhoneShema,
  customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(OrderItemSchema).minLength(1),
  subtotal: vine.number().optional(),
  shippingPrice: vine.number().optional(),
  total: vine.number().optional(),
  discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(OrderStatus),
  storeId: vine.string(),
  metadata: vine.any().optional(),
});

// UpdateOrderSchema
export const UpdateOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerPhone: PhoneShema.optional(),
  customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(OrderItemSchema).minLength(1).optional(),
  subtotal: vine.number().optional(),
  shippingPrice: vine.number().optional(),
  total: vine.number().optional(),
  discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(OrderStatus).optional(),
  storeId: vine.string(),
  metadata: vine.any().optional(),
});
