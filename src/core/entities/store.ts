import { EmbaddedAddress } from '../embadded/address.js'
import { EmbaddedCategory } from '../embadded/category.js'
import { EmbaddedContact } from '../embadded/contact.js'
import { OrderEntity } from './order.js'
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
  address: EmbaddedAddress | null
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
  subscription?: any
  due?: number

  // StoreConfigs
  configs?: StoreConfigs

  // metaPixelIds
  metaPixelIds?: string[] | null

  // tiktokPixelIds
  tiktokPixelIds?: string[] | null

  // googleAnalyticsId
  googleAnalyticsId?: string | null

  // members
  members?: Record<string, StoreMember>
}

export enum StoreMemberRole {
  editor = 'editor',
  viewer = 'viewer',
  confermer = 'confermer',
}

export interface StoreMember {
  name: string
  userId: string
  role: StoreMemberRole
  acceptedAt: any | null
  expiredAt: any | null
  createdAt: any
  active: boolean
  metadata: Record<string, any>
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
  [key: string]: any
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
export interface MetaPixel {
  id: string
  key?: string
}
// tiktok pixel
export interface TiktokPixel {
  id: string
  key?: string
}
// meta pixel integration
export interface MetaPixelIntegration {
  id: string
  pixels: MetaPixel[]
  active: boolean
  metadata: Record<string, any>
}
// tiktok pixel integration
export interface TiktokPixelIntegration {
  id: string
  pixels: TiktokPixel[]
  active: boolean
  metadata: Record<string, any>
}

export interface GoogleAnalyticsIntegration {
  id: string
  active: boolean
  metadata: Record<string, any>
}

// export enum GoogleSheetsColumnType {
//   string = 'string',
//   number = 'number',
//   boolean = 'boolean',
//   date = 'date',
// }
export interface GoogleSheetsColumn<T> {
  field: keyof OrderEntity | null
  name: string
  enabled: boolean
  defaultValue?: T
  // type:
}
export interface GoogleSheetsIntegration {
  id: string
  name: string
  active: boolean
  oauth2?: Record<string, any>
  metadata: Record<string, any>
  columns?: GoogleSheetsColumn<any>[]
}
export interface GoogleTagsIntegration {
  id: string
  active: boolean
  metadata: Record<string, any>
}

export interface StoreIntegrations {
  [key: string]: any
  metadata?: Record<string, any>

  // @Default('default') String id,
  // @Default([]) List<MetaPixel> pixels,
  // @Default(true) bool active,
  // @Default({}) Map<String, dynamic> metadata,
  metaPixel?: MetaPixelIntegration
  tiktokPixel?: TiktokPixelIntegration
  googleAnalytics?: GoogleAnalyticsIntegration
  googleSheet?: GoogleSheetsIntegration
  googleTags?: GoogleTagsIntegration

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
  premium = 'premium',
  vip = 'vip',
  custom = 'custom',
}

export interface StoreSubscription {
  type: StoreSubscriptionType
  name: string
  status: StoreSubscriptionStatus
  startedAt: DateTime
  expiresAt: DateTime | null
  quota: number
  consumed: number
  remaining: number
  metadata: Record<string, any>
}
