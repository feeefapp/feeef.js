import { EmbaddedAddress } from '../embadded/address.js'
import { EmbaddedCategory } from '../embadded/category.js'
import { EmbaddedContact } from '../embadded/contact.js'
import { OrderEntity, OrderStatus, DeliveryStatus, PaymentStatus } from './order.js'
import { MetaPixelEvent, TiktokPixelEvent } from './product.js'
// import { OrderEntity } from "./order.js";
// import { ShippingMethodEntity } from "./shipping_method.js";
import { UserEntity } from './user.js'
import { CategoryEntity } from './category.js'
import { DateTime } from 'luxon'

export interface StoreEntity {
  id: string
  slug: string
  banner: StoreBanner | null
  action: StoreAction | null
  domain: StoreDomain | null
  decoration: StoreDecoration | null
  name: string
  iconUrl: string | null
  logoUrl: string | null
  // deprecated
  ondarkLogoUrl: string | null
  userId: string
  categories: EmbaddedCategory[]
  categoriesRelation?: CategoryEntity[]
  title: string | null
  description: string | null
  addresses: EmbaddedAddress[]
  address: EmbaddedAddress | null
  metadata: Record<string, any>
  contacts: EmbaddedContact[]
  integrations?: StoreIntegrations | null
  publicIntegrations: PublicStoreIntegrations | null
  verifiedAt: any | null
  blockedAt: any | null
  createdAt: any
  updatedAt: any
  // products: ProductEntity[];
  user?: UserEntity
  // orders: OrderEntity[];
  // shippingMethods: ShippingMethodEntity[];
  defaultShippingRates: (number | null)[][] | null

  shippingPriceId?: string | null

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

  // googleTagsId
  googleTagsId?: string | null

  // members
  members?: Record<string, StoreMember>
}

// function that generate public data from the integrations data
export const generatePublicStoreIntegrations = (
  integrations: StoreIntegrations | null | undefined
): PublicStoreIntegrations | null => {
  if (!integrations) return null
  const {
    metaPixel,
    tiktokPixel,
    googleAnalytics,
    googleTags,
    orderdz,
    webhooks,
    ai,
    security,
    customFields,
  } = integrations
  return {
    metaPixel: generatePublicStoreIntegrationMetaPixel(metaPixel) || null,
    tiktokPixel: generatePublicStoreIntegrationTiktokPixel(tiktokPixel) || null,
    googleAnalytics: generatePublicStoreIntegrationGoogleAnalytics(googleAnalytics) || null,
    googleTags: generatePublicStoreIntegrationGoogleTags(googleTags) || null,
    googleSheet: null,
    ai: generatePublicStoreIntegrationAi(ai) || null,
    orderdz: generatePublicStoreIntegrationOrderdz(orderdz) || null,
    webhooks: generatePublicStoreIntegrationWebhooks(webhooks) || null,
    security: generatePublicStoreIntegrationSecurity(security) || null,
    customFields: generatePublicStoreIntegrationCustomFields(customFields) || null,
  }
}

export const generatePublicStoreIntegrationCustomFields = (
  customFields: any | null | undefined
): PublicCustomFieldsIntegration | null | undefined => {
  if (!customFields || !customFields.active) return null
  return {
    fields: (customFields.fields || []).map((field: any) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      multiple: field.multiple,
      minCount: field.minCount,
      maxCount: field.maxCount,
      placeholder: field.placeholder,
      helpText: field.helpText,
      regexPattern: field.regexPattern,
      defaultValue: field.defaultValue,
      order: field.order,
      active: field.active,
    })),
    active: customFields.active,
  }
}
export const generatePublicStoreIntegrationMetaPixel = (
  metaPixel: MetaPixelIntegration | null | undefined
): PublicMetaPixelIntegration | null | undefined => {
  if (!metaPixel) return null
  return {
    pixels: metaPixel.pixels.map((pixel) => ({
      id: pixel.id,
    })),
    active: metaPixel.active,
    objective: metaPixel.objective,
    draftObjective: metaPixel.draftObjective,
  }
}
export const generatePublicStoreIntegrationTiktokPixel = (
  tiktokPixel: TiktokPixelIntegration | null | undefined
): PublicTiktokPixelIntegration | null | undefined => {
  if (!tiktokPixel) return null
  return {
    pixels: tiktokPixel.pixels.map((pixel) => ({
      id: pixel.id,
    })),
    active: tiktokPixel.active,
    objective: tiktokPixel.objective,
    draftObjective: tiktokPixel.draftObjective,
  }
}
export const generatePublicStoreIntegrationGoogleAnalytics = (
  googleAnalytics: GoogleAnalyticsIntegration | null | undefined
): PublicGoogleAnalyticsIntegration | null | undefined => {
  if (!googleAnalytics) return null
  return {
    id: googleAnalytics.id,
    active: googleAnalytics.active,
  }
}
export const generatePublicStoreIntegrationGoogleSheet = (
  googleSheet: GoogleSheetsIntegration | null | undefined
): PublicGoogleSheetsIntegration | null | undefined => {
  if (!googleSheet) return null
  return null
}
export const generatePublicStoreIntegrationGoogleTags = (
  googleTags: GoogleTagsIntegration | null | undefined
): PublicGoogleTagsIntegration | null | undefined => {
  if (!googleTags) return null
  const { id, active } = googleTags
  return {
    id,
    active,
  }
}

/**
 * Generates public AI integration data from private integration data.
 * Only exposes non-sensitive information, keeping the API key private for security.
 */
export const generatePublicStoreIntegrationAi = (
  ai: AiIntegration | null | undefined
): PublicAiIntegration | null | undefined => {
  if (!ai) return null
  return {
    active: ai.active,
    textModel: ai.textModel,
    imageModel: ai.imageModel,
  }
}

/**
 * Generates public OrderDZ integration data from private integration data.
 * Only exposes the URL and active status, keeping the token private for security.
 */
export const generatePublicStoreIntegrationOrderdz = (
  orderdz: OrderdzIntegration | null | undefined
): PublicOrderdzIntegration | null | undefined => {
  if (!orderdz) return null
  return {
    url: orderdz.url,
    active: orderdz.active,
  }
}

/**
 * Generates public webhooks integration data from private integration data.
 * Only exposes non-sensitive information, keeping secrets private for security.
 */
export const generatePublicStoreIntegrationWebhooks = (
  webhooks: WebhooksIntegration | null | undefined
): PublicWebhooksIntegration | null | undefined => {
  if (!webhooks) return null

  const activeWebhooks = webhooks.webhooks.filter((webhook) => webhook.active)

  return {
    webhookCount: webhooks.webhooks.length,
    activeWebhookCount: activeWebhooks.length,
    active: webhooks.active,
    webhookUrls: activeWebhooks.map((webhook) => webhook.url),
  }
}
/**
 * Generates public security integration data from private integration data.
 * Only exposes non-sensitive information, keeping backend protection details private for security.
 */
export const generatePublicStoreIntegrationSecurity = (
  security: SecurityIntegration | null | undefined
): PublicSecurityIntegration | null | undefined => {
  if (!security) return null

  return {
    key: '[none]',
    orders: security.orders
      ? {
          frontend: security.orders.frontend,
        }
      : undefined,
    active: security.active,
  }
}

/**
 * Public interface for OrderDZ integration.
 * Contains only non-sensitive information that can be safely exposed to clients.
 */
export interface PublicOrderdzIntegration {
  url: string
  active: boolean
}

/**
 * Public interface for webhooks integration.
 * Contains only non-sensitive information that can be safely exposed to clients.
 */
export interface PublicWebhooksIntegration {
  /** Total number of configured webhooks */
  webhookCount: number
  /** Number of active webhooks */
  activeWebhookCount: number
  /** Whether the integration is active */
  active: boolean
  /** List of active webhook URLs (without secrets) */
  webhookUrls: string[]
}

export interface PublicMetaPixelIntegration {
  pixels: { id: string }[]
  active: boolean
  objective?: MetaPixelEvent | null
  draftObjective?: MetaPixelEvent | null
}
export interface PublicTiktokPixelIntegration {
  pixels: { id: string }[]
  active: boolean
  objective?: TiktokPixelEvent | null
  draftObjective?: TiktokPixelEvent | null
}
export interface PublicGoogleAnalyticsIntegration {
  id: string
  active: boolean
}
export interface PublicGoogleSheetsIntegration {
  id: string
  active: boolean
}
export interface PublicGoogleTagsIntegration {
  id: string
  active: boolean
}

export interface PublicAiIntegration {
  active: boolean
  textModel: string
  imageModel: string
}

export interface PublicCustomField {
  id: string
  label: string
  type: string
  required?: boolean
  multiple?: boolean
  minCount?: number
  maxCount?: number
  placeholder?: string
  helpText?: string
  regexPattern?: string
  defaultValue?: any
  order?: number
  active?: boolean
}

export interface PublicCustomFieldsIntegration {
  fields: PublicCustomField[]
  active: boolean
}

export interface PublicStoreIntegrations {
  metaPixel: PublicMetaPixelIntegration | null
  tiktokPixel: PublicTiktokPixelIntegration | null
  googleAnalytics: PublicGoogleAnalyticsIntegration | null
  googleSheet: PublicGoogleSheetsIntegration | null
  googleTags: PublicGoogleTagsIntegration | null
  ai: PublicAiIntegration | null
  orderdz: PublicOrderdzIntegration | null
  webhooks: PublicWebhooksIntegration | null
  security: PublicSecurityIntegration | null
  customFields: PublicCustomFieldsIntegration | null
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
  selectedCurrency: string
  languages?: StoreLanguageConfig[]
  defaultLanguage?: string
  countries?: StoreCountryConfig[]
  selectedCountry?: string
  customStatusMappings?: CustomStatusMapping[]
  /** Feature flag to enable custom statuses across the app */
  customStatusEnabled?: boolean
}

export interface CustomStatusMapping {
  /** The custom status name (e.g., "not_respond", "phone_closed_1") */
  name: string
  /** Auto-generated code based on name if not provided (e.g., "not_respond" -> "not_respond") */
  code?: string
  /** Optional color for UI display (hex color as number) */
  color?: number
  /** Whether this custom status is enabled and should be shown in UI */
  enabled?: boolean
  /** Status to map to (null means no change) */
  status?: OrderStatus | null
  /** Delivery status to map to (null means no change) */
  deliveryStatus?: DeliveryStatus | null
  /** Payment status to map to (null means no change) */
  paymentStatus?: PaymentStatus | null
}

export interface StoreCurrencyConfig {
  code: string
  symbol: string
  precision: number
  rate: number
}

export interface StoreLanguageConfig {
  code: string
  name: string
  nativeName: string
  rtl?: boolean
}

export interface StoreCountryConfig {
  code: string
  name: string
  nativeName: string
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
  // primary
  primary: number
  onPrimary?: number
  // on dark mode
  primaryDark?: number
  onPrimaryDark?: number
  // secondary
  secondary?: number
  onSecondary?: number
  // on dark mode
  secondaryDark?: number
  onSecondaryDark?: number

  useLogoDarkFilter?: boolean

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
  name?: string
  id: string
  key?: string
}
// tiktok pixel
export interface TiktokPixel {
  name?: string
  id: string
  accessToken?: string
}
// meta pixel integration
export interface MetaPixelIntegration {
  id: string
  pixels: MetaPixel[]
  objective?: MetaPixelEvent | null
  draftObjective?: MetaPixelEvent | null
  active: boolean
  metadata: Record<string, any>
}
// tiktok pixel integration
export interface TiktokPixelIntegration {
  id: string
  pixels: TiktokPixel[]
  objective?: TiktokPixelEvent | null
  draftObjective?: TiktokPixelEvent | null
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
  // it can be path in json field for exmple metadata.customData
  field: keyof OrderEntity | string | 'skus' | 'quantities' | 'itemsNames'
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
  simple?: boolean
  columns?: GoogleSheetsColumn<any>[]
}
export interface GoogleTagsIntegration {
  id: string
  active: boolean
  metadata: Record<string, any>
}

/**
 * AI integration configuration for Google AI Studio.
 */
export interface AiIntegration {
  active: boolean
  apiKey?: string
  textModel: string
  imageModel: string
  metadata: Record<string, any>
}

/**
 * OrderDZ integration configuration for order confirmation service.
 * This integration allows automatic order confirmation via OrderDZ API.
 */
export interface OrderdzIntegration {
  /** Unique identifier for this integration instance */
  id: string
  /** API endpoint URL for OrderDZ service (e.g., "https://orderdz.com/api/v1/feeef/order") */
  url: string
  /** Authentication token for OrderDZ API */
  token: string
  /** Whether this integration is currently active */
  active: boolean
  /** Whether to automatically send orders when they are marked as sent */
  autoSend?: boolean
  /** Additional metadata for the integration */
  metadata: Record<string, any>
}

/**
 * Ecomanager integration configuration for delivery management.
 * This integration allows order management and tracking via Ecomanager API.
 */
export interface EcomanagerIntegration {
  active: boolean
  baseUrl: string
  token: string
  autoSend?: boolean
  metadata?: Record<string, any>
}

/**
 * Zimou Express integration configuration for delivery management.
 * This integration allows order management and tracking via Zimou Express API.
 */
export interface ZimouIntegration {
  /** Unique identifier for this integration instance */
  id: string
  /** API authentication key for Zimou Express */
  apiKey: string
  /** Whether this integration is currently active */
  active: boolean
  /** Whether to send orders directly without confirmation dialog */
  silentMode?: boolean
  /** Whether to automatically send orders when they are marked as sent */
  autoSend?: boolean
  /** Additional metadata for the integration */
  metadata?: Record<string, any>
}

export interface SecurityIntegrationOrdersProtection {
  frontend: {
    active: boolean
  }
  backend: {
    active: boolean
    phoneTtl: number
    ipTtl: number
    blockDirectOrders: boolean
    adsOnlyMode: boolean
  }
}
export interface PublicSecurityIntegrationOrdersProtection {
  frontend: {
    active: boolean
  }
}
export interface SecurityIntegration {
  orders?: SecurityIntegrationOrdersProtection

  /** Whether this integration is currently active */
  active: boolean
  /** Additional metadata for the integration */
  metadata?: Record<string, any>
}
export interface PublicSecurityIntegration {
  key?: string | null
  orders?: PublicSecurityIntegrationOrdersProtection

  /** Whether this integration is currently active */
  active: boolean
  /** Additional metadata for the integration */
  metadata?: Record<string, any>
}

/**
 * Webhook event types for order lifecycle
 */
export enum WebhookEvent {
  ORDER_CREATED = 'orderCreated',
  ORDER_UPDATED = 'orderUpdated',
  ORDER_DELETED = 'orderDeleted',
}

/**
 * Individual webhook configuration
 */
export interface WebhookConfig {
  /** Unique identifier for this webhook */
  id: string
  /** Human-readable name for this webhook */
  name: string
  /** Target URL where webhook events will be sent */
  url: string
  /** Events this webhook is subscribed to */
  events: WebhookEvent[]
  /** Optional secret key for HMAC signature verification */
  secret?: string
  /** Whether this webhook is currently active */
  active: boolean
  /** Additional HTTP headers to send with webhook requests */
  headers?: Record<string, string>
  /** Additional metadata for this webhook */
  metadata: Record<string, any>
}

/**
 * Webhooks integration configuration for real-time order notifications
 */
export interface WebhooksIntegration {
  /** List of configured webhooks */
  webhooks: WebhookConfig[]
  /** Whether the webhooks integration is active */
  active: boolean
  /** Additional metadata for the integration */
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
  ai?: AiIntegration
  orderdz?: OrderdzIntegration
  webhooks?: WebhooksIntegration

  sms?: any
  telegram?: any
  yalidine?: any
  maystroDelivery?: any
  echotrak?: any
  ecotrack?: any
  ecomanager?: EcomanagerIntegration
  procolis?: any
  noest?: any
  zimou?: ZimouIntegration

  security?: SecurityIntegration
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

/**
 * Input data for creating a new store
 */
export interface StoreCreateInput {
  name: string
  slug?: string
  title?: string
  description?: string
  iconUrl?: string
  logoUrl?: string
  ondarkLogoUrl?: string
  categories?: EmbaddedCategory[]
  addresses?: EmbaddedAddress[]
  contacts?: EmbaddedContact[]
  decoration?: StoreDecoration
  domain?: StoreDomain
  banner?: StoreBanner
  action?: StoreAction
  metadata?: Record<string, any>
  defaultShippingRates?: (number | null)[][] | null
  shippingPriceId?: string
  configs?: StoreConfigs
  metaPixelIds?: string[]
  tiktokPixelIds?: string[]
  googleAnalyticsId?: string
  googleTagsId?: string
}

/**
 * Input data for updating an existing store
 */
export interface StoreUpdateInput {
  name?: string
  slug?: string
  title?: string
  description?: string
  iconUrl?: string
  logoUrl?: string
  ondarkLogoUrl?: string
  categories?: EmbaddedCategory[]
  addresses?: EmbaddedAddress[]
  contacts?: EmbaddedContact[]
  decoration?: StoreDecoration
  domain?: StoreDomain
  banner?: StoreBanner
  action?: StoreAction
  metadata?: Record<string, any>
  defaultShippingRates?: (number | null)[][] | null
  shippingPriceId?: string
  configs?: StoreConfigs
  metaPixelIds?: string[]
  tiktokPixelIds?: string[]
  googleAnalyticsId?: string
  googleTagsId?: string
  integrations?: StoreIntegrations
}

/**
 * Store summary data
 */
export interface StoreSummary {
  ordersCount: number
  productsCount: number
  revenue: number
  topProducts?: Array<{ id: string; name: string; sold: number }>
  ordersByStatus?: Record<string, number>
  recentOrders?: any[]
}

/**
 * Input for adding a store member
 */
export interface AddStoreMemberInput {
  email: string
  role: StoreMemberRole
  name?: string
  metadata?: Record<string, any>
}

/**
 * Input for updating a store member
 */
export interface UpdateStoreMemberInput {
  role?: StoreMemberRole
  name?: string
  metadata?: Record<string, any>
}
