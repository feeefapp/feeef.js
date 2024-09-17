import vine from '@vinejs/vine'
import { EmbaddedCategorySchema, ImageFileSchema } from './helpers.js'
import { SchemaTypes } from '@vinejs/vine/types'
import { ProductStatus } from '../../core/entities/product.js'

export const ProductVariantOptionSchema = vine.object({
  name: vine.string().minLength(1).maxLength(32),
  sku: vine.string().optional(),
  barcode: vine.string().optional(),
  price: vine.number().min(0).max(1000000).optional().nullable(),
  discount: vine.number().min(0).max(1000000).optional().nullable(),
  stock: vine.number().min(0).max(1000000).optional().nullable(),
  sold: vine.number().min(0).max(1000000).optional().nullable(),
  child: vine.any().optional().nullable(),
  // text | image | color
  type: vine.enum(['text', 'image', 'color']),
  value: vine.any().optional(),
})

export const ProductVariantSchema = vine
  .object({
    name: vine.string().minLength(1).maxLength(32),
    options: vine.array(ProductVariantOptionSchema),
  })
  .optional()
export const CreateProductSchema = vine.object({
  slug: vine
    .string()
    // .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(255),
  // .unique(async (db, value, _field) => {
  //   const product = await db.from('products').where('slug', value).first()
  //   return !product
  // }),
  sku: vine.string().optional(),
  barcode: vine.string().optional(),
  decoration: vine.object({}).optional(),
  name: vine.string().maxLength(255),
  photoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  media: vine.array(vine.string()).optional(),
  mediaFiles: vine.array(ImageFileSchema as unknown as SchemaTypes).optional(),
  // storeId must exist in the database
  storeId: vine.string(),
  // .exists(async (_db, _value, field) => {
  //   return !!field.meta.store && (field.meta.store as Store).userId === field.meta.userId
  // }),
  // shippingMethodId if exists must exist in the database
  shippingMethodId: vine
    .string()
    // .exists(async (db, value, field) => {
    //   const user = await db.from('shipping_methods').select('id').where('id', value).first()
    //   return !!user
    // })
    .optional(),
  category: EmbaddedCategorySchema.optional(),
  title: vine.string().maxLength(255).optional(),
  description: vine.string().maxLength(255).optional(),
  body: vine.string().minLength(2).maxLength(10000).optional(),
  price: vine.number().min(0).max(1000000),
  cost: vine.number().min(0).max(1000000).optional(),
  discount: vine.number().min(0).max(1000000).optional(),
  stock: vine.number().min(0).max(1000000).optional(),
  variant: ProductVariantSchema,
  metadata: vine.object({}).optional(),
  status: vine.enum(Object.values(ProductStatus)),
  verifiedAt: vine.date().optional(),
  blockedAt: vine.date().optional(),
})

export const UpdateProductSchema = vine.object({
  slug: vine
    .string()
    // .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(255)
    // .unique(async (db, value, _field) => {
    //   const product = await db
    //     .from('products')
    //     .where('slug', value)
    //     .whereNot('store_id', _field.data.storeId)
    //     .first()
    //   return !product
    // })
    .optional(),
  sku: vine.string().optional(),
  barcode: vine.string().optional(),
  decoration: vine.object({}).optional(),
  name: vine.string().maxLength(255).optional(),
  photoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  media: vine.array(vine.string()).optional(),
  mediaFiles: vine.array(ImageFileSchema as unknown as SchemaTypes).optional(),
  // storeId must exist in the database
  storeId: vine
    .string()
    // .exists(async (_db, _value, field) => {
    //   return !!field.meta.store && (field.meta.store as Store).userId === field.meta.userId
    // })
    .optional(),
  // shippingMethodId if exists must exist in the database
  shippingMethodId: vine
    .string()
    // .exists(async (db, value, field) => {
    //   const user = await db.from('shipping_methods').select('id').where('id', value).first()
    //   return !!user
    // })
    .nullable()
    .optional(),
  category: EmbaddedCategorySchema.optional(),
  title: vine.string().maxLength(255).optional(),
  description: vine.string().maxLength(255).optional(),
  body: vine.string().minLength(2).maxLength(10000).optional(),
  price: vine.number().min(0).max(1000000).optional(),
  cost: vine.number().min(0).max(1000000).optional(),
  discount: vine.number().min(0).max(1000000).optional(),
  stock: vine.number().min(0).max(1000000).optional(),
  variant: ProductVariantSchema,
  metadata: vine.object({}).optional(),
  status: vine.enum(Object.values(ProductStatus)).optional(),
  verifiedAt: vine.date().optional(),
  blockedAt: vine.date().optional(),
})
