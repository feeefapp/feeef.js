import vine from '@vinejs/vine'
import { PhoneShema } from './auth.js'
import { OrderStatus } from 'feeef'
import { CustomOrderTagSchema } from './helpers.js'

export const OrderItemSchema = vine.object({
  productId: vine.string(),
  // productId: vine.string().exists(async (db, value, field) => {
  //   const product = await db.from('products').where('id', value).first()
  //   return !!product
  // }),
  productName: vine.string().optional(),
  productPhotoUrl: vine.string().optional(),
  variantPath: vine.any().optional(),
  quantity: vine.number(),
  price: vine.number().optional(),
})

export const GuestOrderItemSchema = vine.object({
  productId: vine.string(),
  variantPath: vine.string().optional(),
  quantity: vine.number(),
})

export const SendOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerNote: vine.string().optional(),
  customerPhone: vine.string(),
  //   customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingType: vine.enum(['home', 'pickup', 'store']),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(GuestOrderItemSchema).minLength(1),
  //   subtotal: vine.number().optional(),
  //   shippingPrice: vine.number().optional(),
  //   total: vine.number().optional(),
  //   discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(['pending', 'draft']),
  // TODO: validate storeId is exists and not blocked
  storeId: vine.string(),
  metadata: vine.any().optional(),
})

/// store owner section
// CreateOrderSchema
export const CreateOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerNote: vine.string().optional(),
  customerPhone: PhoneShema,
  customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingType: vine.enum(['home', 'pickup', 'store']),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(OrderItemSchema).minLength(1),
  subtotal: vine.number().optional(),
  shippingPrice: vine.number().optional(),
  // total: vine.number().optional(),
  manualTotal: vine.number().optional().nullable(),
  calculatedTotal: vine.number().optional(),
  discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(Object.values(OrderStatus)),
  storeId: vine.string(),
  metadata: vine
    .object({
      customOrderTagHistories: vine
        .array(
          vine.object({
            tag: CustomOrderTagSchema,
            note: vine.string().optional(),
            createdAt: vine.date(),
          })
        )
        .optional(),
    })
    .optional(),
})

// UpdateOrderSchema
export const UpdateOrderSchema = vine.object({
  id: vine.string().optional(),
  customerName: vine.string().optional(),
  customerNote: vine.string().nullable().optional(),
  customerPhone: PhoneShema.optional(),
  customerIp: vine.string().optional(),
  shippingAddress: vine.string().optional(),
  shippingCity: vine.string().optional(),
  shippingState: vine.string().optional(),
  shippingType: vine.enum(['home', 'pickup', 'store']).optional(),
  shippingMethodId: vine.string().optional(),
  paymentMethodId: vine.string().optional(),
  items: vine.array(OrderItemSchema).minLength(1).optional(),
  subtotal: vine.number().optional(),
  shippingPrice: vine.number().optional(),
  // total: vine.number().optional(),
  manualTotal: vine.number().optional().nullable(),
  // calculatedTotal: vine.number().optional(),
  discount: vine.number().optional(),
  coupon: vine.string().optional(),
  status: vine.enum(Object.values(OrderStatus)).optional(),
  storeId: vine.string(),
  metadata: vine.any().optional(),
})
