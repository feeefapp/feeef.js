import vine from '@vinejs/vine'
import { ImageFileSchema } from './helpers.js'

export const PhoneShema = vine.string().regex(/^0(5|6|7)\d{8}$|^0(2)\d{7}$/)

export const SignupSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32),
  email: vine.string(),
  // .unique(async (db, value, field) => {
  //   const user = await db.from('users').where('email', value).first()
  //   return !user
  // })
  phone: PhoneShema
    // .unique(async (db, value, field) => {
    //   const user = await db.from('users').where('phone', value).first()
    //   return !user
    // })
    .optional(),
  photoFile: ImageFileSchema.optional(),
  photoUrl: vine.string().optional(),
  password: vine.string().minLength(8).maxLength(32),
})

export const SigninSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(8).maxLength(32),
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
    // .file({
    //   size: '1mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // })
    .any(),
  photoUrl: vine.string().optional(),
  oldPassword: vine.string().minLength(8).maxLength(32).optional(),
  newPassword: vine.string().minLength(8).maxLength(32).notSameAs('oldPassword').optional(),
})
