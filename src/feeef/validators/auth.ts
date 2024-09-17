import vine from '@vinejs/vine'
import { ImageFileSchema } from './helpers.js'

export const PhoneShema = vine.string().regex(/^0(5|6|7)\d{8}$|^0(2)\d{7}$/)

export const SignupSchema = vine.object({
  // referral is user id, nust be exists
  referral: vine.string().optional().nullable(),
  // .exists(async (db, value, field) => {
  //   const user = await db.from('users').where('id', value).first()
  //   return !!user
  // })
  name: vine.string().minLength(2).maxLength(32),
  email: vine.string(),
  phone: PhoneShema.optional(),
  photoFile: ImageFileSchema.optional(),
  photoUrl: vine.string().optional(),
  password: vine.string().minLength(8).maxLength(32),
  fcmToken: vine.string().optional().nullable(),
})

export const SigninSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(8).maxLength(32),
  fcmToken: vine.string().optional().nullable(),
})

// ResetPasswordSchema
export const ResetPasswordSchema = vine.object({
  email: vine.string().email(),
})

// ResetPasswordWithTokenSchema
export const ResetPasswordWithTokenSchema = vine.object({
  uid: vine.string(),
  token: vine.string(),
})

// SigninWithTokenSchema
export const SigninWithTokenSchema = vine.object({
  token: vine.string(),
})

export const AuthUpdateUserSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32).optional(),
  email: vine
    .string()
    // .unique(async (db, value, field) => {
    //   const user = await db.from('users').where('email', value).first()
    //   return !user
    // })
    .optional(),
  phone: PhoneShema.optional(),
  // for upload file
  photoFile: vine
    .any()
    // .file({
    //   size: '1mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // })
    .optional(),
  photoUrl: vine.string().optional(),
  oldPassword: vine.string().minLength(8).maxLength(32).optional(),
  newPassword: vine.string().minLength(8).maxLength(32).notSameAs('oldPassword').optional(),
})
