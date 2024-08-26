import { EmbaddedAddress } from '../embadded/address.js'
import { EmbaddedCategory } from '../embadded/category.js'
import { EmbaddedContact } from '../embadded/contact.js'
// import { OrderEntity } from "./order.js";
// import { ShippingMethodEntity } from "./shipping_method.js";
import { UserEntity } from './user.js'
import { DateTime } from 'luxon'

export interface StoreEntity {
  id: string
  slug: string
  banner: StoreBanner | null
  action: StoreAction | null
  domain: StoreDomain | null
  decoration: StoreDecoration | null
  name: string
  logoUrl: string | null
  ondarkLogoUrl: string | null
  userId: string
  categories: EmbaddedCategory[]
  title: string | null
  description: string | null
  addresses: EmbaddedAddress[]
  metadata: Record<string, any>
  contacts: EmbaddedContact[]
  integrations: StoreIntegrations
  verifiedAt: any | null
  blockedAt: any | null
  createdAt: any
  updatedAt: any
  // products: ProductEntity[];
  user?: UserEntity
  // orders: OrderEntity[];
  // shippingMethods: ShippingMethodEntity[];
  defaultShippingRates: (number | null)[][] | null

  // subscription
  subscriptio?: any
  due?: number

  // StoreConfigs
  configs?: StoreConfigs
}

export interface StoreConfigs {
  currencies: StoreCurrencyConfig[]
  defaultCurrency: number
}

export interface StoreCurrencyConfig {
  code: string
  symbol: string
  precision: number
  rate: number
}

export interface StoreDomain {
  name: string
  verifiedAt: any | null
  metadata: Record<string, any>
}
export interface StoreBanner {
  title: string
  url?: string | null
  enabled: boolean
  metadata: Record<string, any>
}

export interface StoreDecoration {
  primary: number
  onPrimary?: number
  showStoreLogoInHeader?: boolean
  logoFullHeight?: boolean
  showStoreNameInHeader?: boolean
  metadata?: Record<string, any>
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

export interface StoreIntegrations {
  [key: string]: any
  metadata?: Record<string, any>

  metaPixel?: any
  googleAnalytics?: any
  googleSheet?: any
  sms?: any
  telegram?: any
  yalidine?: any
  maystroDelivery?: any
  echotrak?: any
  procolis?: any
  noest?: any
}

export enum StoreSubscriptionStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum StoreSubscriptionType {
  free = 'free',
  quota = 'quota',
  percentage = 'percentage',
}

export interface StoreSubscription {
  type: StoreSubscriptionType
  status: StoreSubscriptionStatus
  startedAt: DateTime
  expiresAt: DateTime | null
  metadata: Record<string, any>
}

export interface StoreFreeSubscription extends StoreSubscription {
  type: StoreSubscriptionType.free
}

export interface StoreQuotaSubscription extends StoreSubscription {
  type: StoreSubscriptionType.quota
  quota: number
}
// another way is by taking percentage of the sales
export interface StorePercentageSubscription extends StoreSubscription {
  type: StoreSubscriptionType.percentage
  percentage: number
}
