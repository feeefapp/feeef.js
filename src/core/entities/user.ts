/**
 * Represents a user entity in the system.
 */
export interface UserEntity {
  id: string
  name: string | null
  email: string
  phone: string
  password: string
  photoUrl: string | null
  emailVerifiedAt: any | null
  phoneVerifiedAt: any | null
  verifiedAt: any | null
  blockedAt: any | null
  createdAt: any
  updatedAt: any | null
  metadata: Record<string, any>
  wallet: EmbaddedWallet
}

/**
 * Represents an embedded wallet in a user entity.
 */
export interface EmbaddedWallet {
  currency: 'DZD' | 'USD' | 'EUR'
  balance: number
}

/**
 * Represents an authentication token.
 */
export interface AuthToken {
  type: string
  name: string | null
  token: string
  abilities: string[]
  lastUsedAt: any
  expiresAt: any
}

/**
 * Options for creating a user (admin panel)
 */
export interface CreateUserOptions {
  name: string
  email: string
  phone?: string
  password: string
  photoUrl?: string
  metadata?: Record<string, any>
  emailVerifiedAt?: string | Date
  phoneVerifiedAt?: string | Date
  verifiedAt?: string | Date
  blockedAt?: string | Date
  createdByAdmin?: boolean
  initialBalance?: number
}

/**
 * Options for updating a user
 */
export interface UpdateUserOptions {
  name?: string
  email?: string
  phone?: string
  password?: string
  password_confirmation?: string
  photoUrl?: string
  metadata?: Record<string, any>
  emailVerifiedAt?: string | Date
  phoneVerifiedAt?: string | Date
  verifiedAt?: string | Date
  blockedAt?: string | Date
}

/**
 * Represents an access token (returned from tokens endpoint).
 */
export interface AccessToken {
  /** Same value as `identifier` when the API sends both (legacy / convenience). */
  id?: string
  /** Opaque id for `DELETE users/auth/tokens/:identifier` (DB access token id, string or number in JSON). */
  identifier?: string
  type: string
  name: string | null
  /** Present only when a secret was just minted; omitted on session list responses. */
  token?: string
  abilities: string[]
  lastUsedAt: any | null
  expiresAt: any | null
  createdAt?: any
  updatedAt?: any
}

/**
 * Credentials for signing in.
 */
export interface SigninCredentials {
  email: string
  password: string
  fcmToken?: string | null
}

/**
 * Credentials for signing up.
 */
export interface SignupCredentials {
  referral?: string | null
  name: string
  email: string
  phone?: string
  password: string
  photoUrl?: string
  fcmToken?: string | null
}

/**
 * Options for updating user profile.
 */
export interface UserUpdate {
  name?: string
  email?: string
  phone?: string
  photoUrl?: string
  oldPassword?: string
  newPassword?: string
}

/**
 * Options for transferring money between users.
 */
export interface TransferMoneyOptions {
  recipientId?: string
  recipientEmail?: string
  recipientPhone?: string
  amount: number
  note?: string
}

/**
 * Response from a money transfer operation.
 */
export interface TransferMoneyResponse {
  success: boolean
  sender: UserEntity
  recipient: UserEntity
  amount: number
  currency: string
}

/**
 * Options for linking a social account.
 */
export interface LinkSocialAccountOptions {
  provider: 'google' | 'github' | 'apple' | 'facebook'
  code: string
}

/**
 * Options for signing in with a social provider.
 */
export interface SigninWithSocialOptions {
  code: string
  fcmToken?: string | null
}

/**
 * Options for creating a short-lived, single-use Feeef auth code (QR / device login).
 */
export interface CreateAuthCodeOptions {
  /** Optional deep-link destination to return alongside the code. */
  redirect?: string
}

/**
 * Response from creating an auth code.
 */
export interface CreateAuthCodeResponse {
  authCode: string
  expiresInSeconds: number
  redirect: string | null
}

/**
 * Options for signing in with a one-time Feeef auth code (OAuth-like semantics).
 */
export interface SigninWithCodeOptions {
  authCode: string
}

/**
 * Options for passkey registration start.
 */
export interface StartPasskeyRegistrationOptions {
  deviceName?: string
}

/**
 * Options for finishing passkey registration.
 */
export interface FinishPasskeyRegistrationOptions {
  registrationResponse: Record<string, any>
  deviceName?: string
}

/**
 * Options for starting passkey authentication.
 */
export interface StartPasskeyAuthenticationOptions {
  email?: string
}

/**
 * Options for finishing passkey authentication.
 */
export interface FinishPasskeyAuthenticationOptions {
  authenticationResponse: Record<string, any>
}

/**
 * Represents a passkey entry.
 */
export interface Passkey {
  id: string
  name: string
  deviceName?: string
  createdAt: any
  lastUsedAt: any | null
}
