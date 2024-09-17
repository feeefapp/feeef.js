import vine from '@vinejs/vine'
import { ImageFileSchema } from './helpers.js'
import { DefaultShippingRatesSchema } from './user_stores.js'
import { ShippingMethodPolicy, ShippingMethodStatus } from '../../core/entities/shipping_method.js'

export const CreateShippingMethodSchema = vine.object({
  name: vine.string(),
  description: vine.string().optional(),
  photoUrl: vine.string().optional(),
  ondarkPhotoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  ondarkPhotoFile: ImageFileSchema.optional(),
  price: vine.number(),
  //   forks: vine.number(),
  //   sourceId: vine.string(),
  storeId: vine.string(),
  rates: DefaultShippingRatesSchema.optional(),
  status: vine.enum(Object.values(ShippingMethodStatus)),
  policy: vine.enum(Object.values(ShippingMethodPolicy)),
  //   verifiedAt: vine.date(),
})

export const UpdateShippingMethodSchema = vine.object({
  name: vine.string().optional(),
  description: vine.string().optional(),
  photoUrl: vine.string().optional(),
  ondarkPhotoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  ondarkPhotoFile: ImageFileSchema.optional(),
  price: vine.number().optional(),
  //   forks: vine.number().optional(),
  //   sourceId: vine.string().optional(),
  storeId: vine.string().optional(),
  rates: DefaultShippingRatesSchema.optional().optional(),
  status: vine.enum(Object.values(ShippingMethodStatus)).optional(),
  policy: vine.enum(Object.values(ShippingMethodPolicy)).optional(),
  //   verifiedAt: vine.date().optional(),
})

// ForkShippingMethodSchema
export const ForkShippingMethodSchema = vine.object({
  sourceId: vine.string(),
  storeId: vine.string(),
})
