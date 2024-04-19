import vine from '@vinejs/vine';
import { AvatarFileSchema, ContactSchema, DomainSchema, EmbaddedAddressSchema, EmbaddedCategorySchema, StoreDecorationSchema, } from './helpers.js';
import { DefaultShippingRatesSchema } from './user_stores.js';
export const CreateStoreSchema = vine.object({
    name: vine.string().minLength(2).maxLength(32),
    slug: vine
        .string()
        .regex(/^[a-z0-9-]+$/)
        .minLength(2)
        .maxLength(32)
    // .unique(async (db, value, field) => {
    //   const store = await db.from('stores').where('slug', value).first()
    //   return !store
    // })
    ,
    domain: vine
        .object({
        name: vine.string().minLength(2).maxLength(32),
        verifiedAt: vine.date().optional(),
        metadata: vine.object({}).optional(),
    })
        .optional(),
    decoration: vine
        .object({
        primaryColor: vine.number().min(0x0).max(0xffffffff),
        metadata: vine.any().optional(),
    })
        .optional(),
    logoUrl: vine.string().optional(),
    ondarkLogoUrl: vine.string().optional(),
    logoFile: AvatarFileSchema.optional(),
    ondarkLogoFile: AvatarFileSchema.optional(),
    userId: vine.string()
    // .exists(async (db, value, field) => {
    //   const user = await db.from('users').where('id', value).first()
    //   return !!user
    // })
    ,
    categories: vine.array(EmbaddedCategorySchema).optional(),
    title: vine.string().minLength(2).maxLength(255).optional(),
    description: vine.string().minLength(2).maxLength(255).optional(),
    addresses: vine.array(EmbaddedAddressSchema).optional(),
    metadata: vine.object({}).optional(),
    contacts: vine
        .array(vine.object({
        type: vine.string().minLength(2).maxLength(32),
        value: vine.string().minLength(2).maxLength(255),
        metadata: vine.object({}).optional(),
    }))
        .optional(),
    shippingRates: vine.array(vine.string().minLength(2).maxLength(48)).optional(),
    verifiedAt: vine.date().optional(),
    blockedAt: vine.date().optional(),
    integrations: vine.array(vine.any()).optional(),
    // default_shipping_rates
    defaultShippingRates: DefaultShippingRatesSchema.optional(),
});
// UpdateStoreSchema
export const UpdateStoreSchema = vine.object({
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
    logoUrl: vine.string().optional(),
    ondarkLogoUrl: vine.string().optional(),
    logoFile: AvatarFileSchema.optional(),
    ondarkLogoFile: AvatarFileSchema.optional(),
    userId: vine
        .string()
        // .exists(async (db, value, field) => {
        //   const user = await db.from('users').where('id', value).first()
        //   return !!user
        // })
        .optional(),
    categories: vine.array(EmbaddedCategorySchema).optional(),
    title: vine.string().minLength(2).maxLength(255).optional(),
    description: vine.string().minLength(2).maxLength(255).optional(),
    addresses: vine.array(EmbaddedAddressSchema).optional(),
    metadata: vine.object({}).optional(),
    contacts: vine.array(ContactSchema).optional(),
    shippingRates: vine.array(vine.string().minLength(2).maxLength(48)).optional(),
    verifiedAt: vine.date().optional(),
    blockedAt: vine.date().optional(),
    // integrations
    integrations: vine.array(vine.any()).optional(),
    // default_shipping_rates
    defaultShippingRates: DefaultShippingRatesSchema.optional(),
});
