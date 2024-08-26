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

export interface EmbaddedWallet {
  currency: 'DZD' | 'USD' | 'EUR'
  balance: number
}

export interface AuthToken {
  type: string
  name: string | null
  token: string
  abilities: string[]
  lastUsedAt: any
  expiresAt: any
}
