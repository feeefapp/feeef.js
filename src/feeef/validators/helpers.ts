import vine from '@vinejs/vine'

export const AvatarFileSchema = vine.any()
// .file({
//   size: '1mb',
//   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
// })

export const ImageFileSchema = vine.any()
// .file({
//   size: '1mb',
//   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
// })

export const DomainSchema = vine.object({
  name: vine.string().minLength(3).maxLength(32),
  verifiedAt: vine.date().optional(),
  metadata: vine.object({}).optional(),
})

// decoration
export const StoreDecorationSchema = vine.object({
  primaryColor: vine.number().min(0x0).max(0xffffffff),
  showStoreLogoInHeader: vine.boolean().optional(),
  logoFullHeight: vine.boolean().optional(),
  showStoreNameInHeader: vine.boolean().optional(),
  metadata: vine.any().optional(),
})

// export const EmbaddedImageSchema = vine.object({
//   url: vine.string().url(),
//   alt: vine.string().optional(),
//   width: vine.number().optional(),
//   height: vine.number().optional(),
// })

export const EmbaddedCategorySchema = vine.object({
  name: vine.string().minLength(2).maxLength(32),
  description: vine.string().minLength(2).maxLength(255).optional(),
  photoUrl: vine.string().optional(),
  ondarkPhotoUrl: vine.string().optional(),
  photoFile: AvatarFileSchema.optional(),
  ondarkPhotoFile: AvatarFileSchema.optional(),
  metadata: vine.object({}).optional(),
})

export const EmbaddedAddressSchema = vine.object({
  country: vine.string().minLength(2).maxLength(32).optional(),
  state: vine.string().minLength(2).maxLength(32).optional(),
  city: vine.string().minLength(2).maxLength(32).optional(),
  street: vine.string().minLength(2).maxLength(32).optional(),
  zip: vine.string().minLength(2).maxLength(32).optional(),
  metadata: vine.object({}).optional().optional(),
})

export const EmbaddedContactSchema = vine.object({
  type: vine.string().minLength(2).maxLength(32),
  value: vine.string().minLength(2).maxLength(255),
  metadata: vine.object({}).optional(),
})

export const ContactSchema = vine.object({
  type: vine.string().minLength(2).maxLength(32),
  value: vine.string().minLength(2).maxLength(255),
  metadata: vine.object({}).optional(),
})
