// import { ProductStatus } from '#models/product'
import vine from '@vinejs/vine'
import { EmbaddedCategorySchema, ImageFileSchema } from './helpers.js'
import { ProductStatus } from '../../core/core.js'
// import Store from '#models/store'

export const ProductVariantOptionSchema = vine.object({
  name: vine.string().minLength(1).maxLength(32),
  sku: vine.string().optional(),
  price: vine.number().min(0).max(1000000).optional().nullable(),
  discount: vine.number().min(0).max(1000000).optional().nullable(),
  stock: vine.number().min(0).max(1000000).optional().nullable(),
  sold: vine.number().min(0).max(1000000).optional().nullable(),
  child: vine.any().optional().nullable(),
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
    .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(32),
  // .unique(async (db, value, field) => {
  //   const product = await db.from('products').where('slug', value).first()
  //   return !product
  // }),
  sku: vine.string().optional(),
  decoration: vine.object({}).optional(),
  name: vine.string().minLength(2).maxLength(32),
  photoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  media: vine.array(vine.string()).optional(),
  mediaFiles: vine.array(ImageFileSchema).optional(),
  // storeId must exist in the database
  storeId: vine.string(),
  // .exists(async (db, value, field) => {
  //   return !!field.meta.store && (field.meta.store as Store).userId === field.meta.userId
  // }),
  category: EmbaddedCategorySchema.optional(),
  title: vine.string().minLength(2).maxLength(255),
  description: vine.string().minLength(2).maxLength(255).optional(),
  body: vine.string().minLength(2).maxLength(1000).optional(),
  price: vine.number().min(0).max(1000000),
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
    .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(32)
    // .unique(async (db, value, field) => {
    //   const product = await db.from('products').where('slug', value).first()
    //   return !product
    // })
    .optional(),
  sku: vine.string().optional(),
  decoration: vine.object({}).optional(),
  name: vine.string().minLength(2).maxLength(32).optional(),
  photoUrl: vine.string().optional(),
  photoFile: ImageFileSchema.optional(),
  media: vine.array(vine.string()).optional(),
  mediaFiles: vine.array(ImageFileSchema).optional(),
  // storeId must exist in the database
  storeId: vine.string(),
  // .exists(async (db, value, field) => {
  //   return !!field.meta.store && (field.meta.store as Store).userId === field.meta.userId
  // })
  // .optional(),
  category: EmbaddedCategorySchema.optional(),
  title: vine.string().minLength(2).maxLength(255).optional(),
  description: vine.string().minLength(2).maxLength(255).optional(),
  body: vine.string().minLength(2).maxLength(1000).optional(),
  price: vine.number().min(0).max(1000000).optional(),
  discount: vine.number().min(0).max(1000000).optional(),
  stock: vine.number().min(0).max(1000000).optional(),
  variant: ProductVariantSchema,
  metadata: vine.object({}).optional(),
  status: vine.enum(Object.values(ProductStatus)),
  verifiedAt: vine.date().optional(),
  blockedAt: vine.date().optional(),
})
