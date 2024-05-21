import vine from '@vinejs/vine'
import {
  AvatarFileSchema,
  EmbaddedContactSchema,
  DomainSchema,
  EmbaddedAddressSchema,
  EmbaddedCategorySchema,
  StoreBunner,
  StoreDecorationSchema,
} from './helpers.js'
// "defaultShippingRates.1"
export const DefaultShippingRatesSchema = vine.array(
  vine.array(vine.number().min(0).max(100000).nullable()).nullable()
)

export const CreateUserStoreSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32),
  slug: vine
    .string()
    .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(32),
  // .unique(async (db, value, field) => {
  //   const store = await db.from('stores').where('slug', value).first()
  //   return !store
  // })
  domain: vine
    .object({
      name: vine.string().minLength(2).maxLength(32),
    })
    .optional(),
  decoration: StoreDecorationSchema.optional(),

  banner: StoreBunner.optional(),
  logoUrl: vine.string().optional(),
  ondarkLogoUrl: vine.string().optional(),
  logoFile: AvatarFileSchema.optional(),
  ondarkLogoFile: AvatarFileSchema.optional(),
  categories: vine.array(EmbaddedCategorySchema).optional(),
  title: vine.string().minLength(2).maxLength(255).optional(),
  description: vine.string().minLength(2).maxLength(255).optional(),
  addresses: vine.array(EmbaddedAddressSchema).optional(),
  metadata: vine.object({}).optional(),
  contacts: vine
    .array(
      vine.object({
        type: vine.string().minLength(2).maxLength(32),
        value: vine.string().minLength(2).maxLength(255),
        metadata: vine.object({}).optional(),
      })
    )
    .optional(),
  defaultShippingRates: DefaultShippingRatesSchema.optional(),
  integrations: vine.array(vine.any()).optional(),
})

// UpdateStoreSchema
export const UpdateUserStoreSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32).optional(),
  slug: vine
    .string()
    .regex(/^[a-z0-9-]+$/)
    .minLength(2)
    .maxLength(32)
    // .unique(async (db, value, field) => {
    //   const store = await db.from('stores').where('slug', value).first()
    //   return !store
    // })
    .optional(),
  domain: DomainSchema.optional(),
  decoration: StoreDecorationSchema.optional(),
  banner: StoreBunner.optional(),
  logoUrl: vine.string().nullable().optional(),
  ondarkLogoUrl: vine.string().nullable().optional(),
  logoFile: AvatarFileSchema.optional(),
  ondarkLogoFile: AvatarFileSchema.optional(),
  categories: vine.array(EmbaddedCategorySchema).optional(),
  title: vine.string().minLength(2).maxLength(255).optional(),
  description: vine.string().minLength(2).maxLength(255).optional(),
  addresses: vine.array(EmbaddedAddressSchema).optional(),
  metadata: vine.object({}).optional(),
  contacts: vine.array(EmbaddedContactSchema).optional(),
  defaultShippingRates: DefaultShippingRatesSchema.optional(),
  integrations: vine.array(vine.any()).optional(),
})
