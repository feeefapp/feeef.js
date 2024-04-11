import vine from "@vinejs/vine";

// User Schemas
//CreateUserSchema
export const CreateUserSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32),
  email: vine.string(),
  // .unique(async (db, value, field) => {
  //   const user = await db.from('users').where('email', value).first()
  //   return !user
  // }),
  phone: vine
    .string()
    .regex(/^0(5|6|7)\d{8}$|^0(2)\d{7}$/)
    // .unique(async (db, value, field) => {
    //   const user = await db.from('users').where('phone', value).first()
    //   return !user
    // })
    .optional(),
  password: vine.string().minLength(8).maxLength(32),
  // for upload file
  photoFile: vine.any(),
  // .file({
  //   size: '1mb',
  //   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  // })
  // .optional(),
  photoUrl: vine.string().optional(),
  // metadata (any object)
  metadata: vine.object({}).optional(),
  // dates
  emailVerifiedAt: vine.date().optional(),
  phoneVerifiedAt: vine.date().optional(),
  verifiedAt: vine.date().optional(),
  blockedAt: vine.date().optional(),
});

//UpdateUserSchema
export const UpdateUserSchema = vine.object({
  name: vine.string().minLength(2).maxLength(32).optional(),
  email: vine
    .string()
    // .unique(async (db, value, field) => {
    //   const user = await db.from('users').where('email', value).first()
    //   return !user
    // })
    .optional(),
  phone: vine
    .string()
    // .regex(/^\d{10}$/)
    // must start with 0 then if secend is (5|6|7) then 8 digits and if secend is (2) then 7 digits
    .regex(/^0(5|6|7)\d{8}$|^0(2)\d{7}$/)
    .optional(),
  password: vine.string().minLength(8).maxLength(32).confirmed().optional(),
  // for upload file
  photoFile: vine
    // .file({
    //   size: '1mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    // })
    .any(),
  photoUrl: vine.string().optional(),
  // metadata (any object)
  metadata: vine.object({}).optional(),
  // dates
  emailVerifiedAt: vine.date().optional(),
  phoneVerifiedAt: vine.date().optional(),
  verifiedAt: vine.string().optional(),
  blockedAt: vine.date().optional(),
});
