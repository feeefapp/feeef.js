export enum EmbaddedContactType {
  phone = 'phone',
  email = 'email',
  facebook = 'facebook',
  twitter = 'twitter',
  instagram = 'instagram',
  linkedin = 'linkedin',
  website = 'website',
  whatsapp = 'whatsapp',
  telegram = 'telegram',
  signal = 'signal',
  viber = 'viber',
  skype = 'skype',
  zoom = 'zoom',
  other = 'other',
}

// EmbaddedContactType is not enum but can only be: "phone" | "email" | "facebook" | "twitter" | "instagram" | "linkedin" | "website" | "whatsapp" | "telegram" | "signal" | "viber" | "skype" | "zoom" | "other

export interface EmbaddedContact {
  type: EmbaddedContactType
  value: string
  metadata?: Record<string, any>
}
