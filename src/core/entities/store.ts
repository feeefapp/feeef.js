import { EmbaddedAddress } from '../embadded/address.js'
import { EmbaddedCategory } from '../embadded/category.js'
import { EmbaddedContact } from '../embadded/contact.js'
// import { OrderEntity } from "./order.js";
// import { ShippingMethodEntity } from "./shipping_method.js";
import { UserEntity } from './user.js'

export interface StoreEntity {
  id: string
  slug: string
  banner: StoreBanner | null
  action: StoreAction | null
  domain: StoreDomain | null
  decoration: StoreDecoration | null
  name: string | null
  logoUrl: string | null
  ondarkLogoUrl: string | null
  userId: string
  categories: EmbaddedCategory[]
  title: string | null
  description: string | null
  addresses: EmbaddedAddress[]
  metadata: Record<string, any>
  contacts: EmbaddedContact[]
  integrations: StoreIntegration[]
  verifiedAt: any | null
  blockedAt: any | null
  createdAt: any
  updatedAt: any
  // products: ProductEntity[];
  user: UserEntity
  // orders: OrderEntity[];
  // shippingMethods: ShippingMethodEntity[];
}

export interface StoreDomain {
  name: string
  verifiedAt: any | null
  metadata: Record<string, any>
}
export interface StoreBanner {
  title: string
  url?: string | null
}

export interface StoreDecoration {
  primaryColor: number
  showStoreLogoInHeader?: boolean
  logoFullHeight?: boolean
  showStoreNameInHeader?: boolean
  metadata?: Record<string, any>
}

export interface StoreIntegration {
  type: StoreIntegrations
  // any
  [key: string]: any
  metadata: Record<string, any>
}

export enum StoreIntegrations {
  telegram = 'telegram',
  facebookPixel = 'facebook_pixel',
  googleAnalytics = 'google_analytics',
  googleSheet = 'google_sheet',
  sms = 'sms',
}

export interface StoreAction {
  label: string
  url: string
  type: StoreActionType
}

export enum StoreActionType {
  link = 'link',
  whatsapp = 'whatsapp',
  telegram = 'telegram',
  phone = 'phone',
}
