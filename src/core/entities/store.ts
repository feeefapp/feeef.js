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

  /** Active full-site template (`store_templates.id`) when set. */
  templateId?: string | null
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
    clarity,
    orderdz,
    webhooks,
    ai,
    security,
    customFields,
    payment,
  } = integrations
  return {
    metaPixel: generatePublicStoreIntegrationMetaPixel(metaPixel) || null,
    tiktokPixel: generatePublicStoreIntegrationTiktokPixel(tiktokPixel) || null,
    googleAnalytics: generatePublicStoreIntegrationGoogleAnalytics(googleAnalytics) || null,
    googleTags: generatePublicStoreIntegrationGoogleTags(googleTags) || null,
    clarity: generatePublicStoreIntegrationClarity(clarity) || null,
    googleSheet: null,
    ai: generatePublicStoreIntegrationAi(ai) || null,
    orderdz: generatePublicStoreIntegrationOrderdz(orderdz) || null,
    webhooks: generatePublicStoreIntegrationWebhooks(webhooks) || null,
    security: generatePublicStoreIntegrationSecurity(security) || null,
    customFields: generatePublicStoreIntegrationCustomFields(customFields) || null,
    payment: generatePublicStoreIntegrationPayment(payment) || null,
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
/**
 * Generates public Meta Pixel integration data from private integration data.
 * Only exposes non-sensitive information (pixel IDs, active status, objectives).
 * Sensitive data like oauth2 tokens, pixel API keys, and metadata are NOT exposed.
 */
export const generatePublicStoreIntegrationMetaPixel = (
  metaPixel: MetaPixelIntegration | null | undefined
): PublicMetaPixelIntegration | null | undefined => {
  if (!metaPixel) return null
  // NOTE: oauth2, pixel.key, and metadata are intentionally excluded for security
  return {
    pixels: metaPixel.pixels.map((pixel) => ({
      id: pixel.id,
    })),
    active: metaPixel.active,
    objective: metaPixel.objective,
    draftObjective: metaPixel.draftObjective,
    mode: metaPixel.mode,
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
    mode: tiktokPixel.mode,
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
 * Microsoft Clarity: only the project / tracking id is public (injected in storefront script).
 * Optional apiKey is for Clarity APIs and is never exposed to the public store JSON.
 */
export const generatePublicStoreIntegrationClarity = (
  clarity: ClarityIntegration | null | undefined
): PublicClarityIntegration | null | undefined => {
  if (!clarity) return null
  if (!clarity.active) return null
  const code = typeof clarity.trackingCode === 'string' ? clarity.trackingCode.trim() : ''
  if (!code) return null
  return {
    active: true,
    trackingCode: code,
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
function toPublicSecurityOption(
  raw: SecurityOption | null | undefined
): PublicSecurityOption | undefined {
  if (
    !raw ||
    typeof raw.active !== 'boolean' ||
    raw.treatment === undefined ||
    raw.treatment === null
  ) {
    return undefined
  }
  return {
    active: raw.active,
    ttl: typeof raw.ttl === 'number' && !Number.isNaN(raw.ttl) ? raw.ttl : 0,
    treatment: raw.treatment,
  }
}

function toPublicMinTimeInPage(
  raw: SecurityMinTimeOption | null | undefined
): PublicSecurityMinTimeOption | undefined {
  if (
    !raw ||
    typeof raw.active !== 'boolean' ||
    raw.treatment === undefined ||
    raw.treatment === null
  ) {
    return undefined
  }
  return {
    active: raw.active,
    duration:
      typeof raw.duration === 'number' && !Number.isNaN(raw.duration) ? raw.duration : 0,
    treatment: raw.treatment,
  }
}

function toPublicCountries(
  raw: SecurityCountriesOption | null | undefined
): PublicSecurityCountriesOption | undefined {
  if (
    !raw ||
    typeof raw.active !== 'boolean' ||
    raw.treatment === undefined ||
    raw.treatment === null
  ) {
    return undefined
  }
  return {
    active: raw.active,
    treatment: raw.treatment,
    allowed: raw.allowed ?? null,
    blocked: Array.isArray(raw.blocked) ? [...raw.blocked] : [],
  }
}

function toPublicSources(
  raw: SecuritySourcesOption | null | undefined
): PublicSecuritySourcesOption | undefined {
  if (
    !raw ||
    typeof raw.active !== 'boolean' ||
    raw.treatment === undefined ||
    raw.treatment === null
  ) {
    return undefined
  }
  return {
    active: raw.active,
    treatment: raw.treatment,
    allowed: raw.allowed ?? null,
    blocked: Array.isArray(raw.blocked) ? [...raw.blocked] : [],
  }
}

/**
 * Generates public security integration data from private integration data.
 * Exposes storefront-safe rules: frontend, doubleSend, minTimeInPage, countries, sources.
 * Fingerprint, ip, phone, and ads stay server-only.
 */
export const generatePublicStoreIntegrationSecurity = (
  security: SecurityIntegration | null | undefined
): PublicSecurityIntegration | null | undefined => {
  if (!security) return null

  const opts = security.options
  const frontend = toPublicSecurityOption(opts?.frontend)
  const doubleSend = toPublicSecurityOption(opts?.doubleSend)
  const minTimeInPage = toPublicMinTimeInPage(opts?.minTimeInPage)
  const countries = toPublicCountries(opts?.countries)
  const sources = toPublicSources(opts?.sources)

  const options: PublicSecurityOptions = {
    ...(frontend ? { frontend } : {}),
    ...(doubleSend ? { doubleSend } : {}),
    ...(minTimeInPage ? { minTimeInPage } : {}),
    ...(countries ? { countries } : {}),
    ...(sources ? { sources } : {}),
  }

  return {
    active: security.active,
    options,
  }
}

/**
 * Generates public payment integration data from private integration data.
 * Only exposes non-sensitive information (method IDs, names, active status).
 * Sensitive data like API keys, client secrets are NOT exposed.
 */
export const generatePublicStoreIntegrationPayment = (
  payment: PaymentIntegration | null | undefined
): PublicPaymentIntegration | null | undefined => {
  if (!payment) return null

  return {
    active: payment.active,
    methods: payment.methods.map((method) => ({
      id: method.id,
      name: method.name,
      active: method.active,
      // API keys, client secrets, etc. are intentionally excluded
    })),
    defaultMethod: payment.defaultMethod,
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
  mode?: PixelReportMode | null
}
export interface PublicTiktokPixelIntegration {
  pixels: { id: string }[]
  active: boolean
  objective?: TiktokPixelEvent | null
  draftObjective?: TiktokPixelEvent | null
  mode?: PixelReportMode | null
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

/** Public Clarity data: project id for the tag script only */
export interface PublicClarityIntegration {
  active: boolean
  trackingCode: string
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

/**
 * Public payment method (no sensitive data like API keys)
 */
export interface PublicPaymentMethod {
  id: string // Slug identifier (e.g., 'chargily', 'paypal')
  name: string // Display name (e.g., 'Chargily Pay', 'PayPal')
  active: boolean
}

/**
 * Public payment integration (exposes only non-sensitive information)
 */
export interface PublicPaymentIntegration {
  active: boolean
  methods: PublicPaymentMethod[]
  defaultMethod?: string // Method ID to use by default
}

export interface PublicStoreIntegrations {
  metaPixel: PublicMetaPixelIntegration | null
  tiktokPixel: PublicTiktokPixelIntegration | null
  googleAnalytics: PublicGoogleAnalyticsIntegration | null
  googleSheet: PublicGoogleSheetsIntegration | null
  googleTags: PublicGoogleTagsIntegration | null
  /** Clarity project id for client script only; apiKey is never public */
  clarity: PublicClarityIntegration | null
  ai: PublicAiIntegration | null
  orderdz: PublicOrderdzIntegration | null
  webhooks: PublicWebhooksIntegration | null
  security: PublicSecurityIntegration | null
  customFields: PublicCustomFieldsIntegration | null
  payment: PublicPaymentIntegration | null
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

export enum StoreInviteStatus {
  pending = 'pending',
  accepted = 'accepted',
  revoked = 'revoked',
  expired = 'expired',
}

export interface StoreInvite {
  id: string
  storeId: string
  email: string
  role: StoreMemberRole
  invitedBy: string
  status: StoreInviteStatus
  acceptedAt: any | null
  expiresAt: any
  metadata: Record<string, any>
  createdAt: any
  updatedAt: any
  store?: { id: string; name: string; iconUrl?: string }
}

export interface CreateStoreInviteInput {
  email: string
  role: StoreMemberRole
  expiresAt?: string
  metadata?: Record<string, any>
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
  /** Codes (or names) of other mappings suggested as the next workflow step */
  next?: string[]
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
/**
 * Controls where pixel conversion events are sent: server-only (CAPI), client-only (store frontend), or both.
 * When unset (auto), server is used if an API key is configured; otherwise client-only.
 */
export enum PixelReportMode {
  server = 'server',
  client = 'client',
  both = 'both',
}
export interface MetaPixel {
  name?: string
  id: string
  key?: string
}

/**
 * Facebook Marketing OAuth data
 * Used for accessing Facebook Marketing API (pixels, ads, etc.)
 */
export interface FacebookMarketingOAuth {
  accessToken: string
  tokenType?: string
  expiresIn?: number
  expiresAt?: string // ISO date string
  scopes?: string[]
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
  /** Facebook Marketing OAuth data - for accessing pixels via API */
  oauth2?: FacebookMarketingOAuth | null
  /** Where to send events: server (CAPI), client (store frontend), or both. Omit for auto (prefer server if key set). */
  mode?: PixelReportMode | null
}
// tiktok pixel integration
export interface TiktokPixelIntegration {
  id: string
  pixels: TiktokPixel[]
  objective?: TiktokPixelEvent | null
  draftObjective?: TiktokPixelEvent | null
  active: boolean
  metadata: Record<string, any>
  /** Where to send events: server, client, or both. Omit for auto (prefer server if accessToken set). */
  mode?: PixelReportMode | null
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
 * Microsoft Clarity session analytics.
 * trackingCode is the project id (public, used in storefront script).
 * apiKey is optional and used for server-side Clarity APIs only — never sent in publicIntegrations.
 */
export interface ClarityIntegration {
  active: boolean
  /** Clarity project id (e.g. wi0wntig7s) */
  trackingCode: string
  apiKey?: string | null
  metadata?: Record<string, any>
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

/**
 * ZR Express integration configuration for delivery management.
 * This integration allows order management and tracking via ZR Express API.
 * Uses header-based authentication (x-api-key, x-tenant).
 */
export interface ZrexpressIntegration {
  /** Unique identifier for this integration instance */
  id: string
  /** API key for ZR Express (x-api-key header) */
  apiKey: string
  /** Tenant UUID for ZR Express (x-tenant header) */
  tenantId: string
  /** Whether this integration is currently active */
  active: boolean
  /** Whether to send orders directly without confirmation dialog */
  silentMode?: boolean
  /** Whether to automatically send orders when they are marked as sent */
  autoSend?: boolean
  /** Additional metadata for the integration */
  metadata?: Record<string, any>
}

// Security Treatment enum
export enum SecurityTreatment {
  block = 'block',
  warning = 'warning',
  fake = 'fake',
}

// Base security option with TTL and treatment (TTL optional when inactive / unset)
export interface SecurityOption {
  active: boolean
  ttl?: number | null
  treatment: SecurityTreatment
}

// Min-time-on-page option
export interface SecurityMinTimeOption {
  active: boolean
  duration: number // seconds
  treatment: SecurityTreatment
}

// Country filtering option
export interface SecurityCountriesOption {
  active: boolean
  treatment: SecurityTreatment
  allowed: string[] | null // ISO codes; null = allow all
  blocked: string[]
}

// Traffic source filtering option
export interface SecuritySourcesOption {
  active: boolean
  treatment: SecurityTreatment
  allowed: string[] | null // e.g., ["ads", "organic"]
  blocked: string[]
}

/** Storefront-safe min-time rule (same shape as private; no secrets). */
export type PublicSecurityMinTimeOption = SecurityMinTimeOption
/** Storefront-safe country allow/block lists (policy only). */
export type PublicSecurityCountriesOption = SecurityCountriesOption
/** Storefront-safe traffic-source allow/block lists (policy only). */
export type PublicSecuritySourcesOption = SecuritySourcesOption

// All security options (private). Keys match API / Vine: each block is optional.nullable.
export interface SecurityOptions {
  fingerprint?: SecurityOption | null
  ip?: SecurityOption | null
  phone?: SecurityOption | null
  ads?: SecurityOption | null
  frontend?: SecurityOption | null
  doubleSend?: SecurityOption | null
  minTimeInPage?: SecurityMinTimeOption | null
  countries?: SecurityCountriesOption | null
  sources?: SecuritySourcesOption | null
}

// Private security integration (merchant app)
export interface SecurityIntegration {
  active: boolean
  options?: SecurityOptions | null
  metadata?: Record<string, any>
}

// Public security option - only active, ttl, treatment (ttl normalized for clients)
export interface PublicSecurityOption {
  active: boolean
  ttl: number
  treatment: SecurityTreatment
}

// Public security options for storefronts (client-enforceable / policy visibility).
// Fingerprint, ip, phone, and ads remain server-only.
export interface PublicSecurityOptions {
  frontend?: PublicSecurityOption
  doubleSend?: PublicSecurityOption
  minTimeInPage?: PublicSecurityMinTimeOption
  countries?: PublicSecurityCountriesOption
  sources?: PublicSecuritySourcesOption
}

// Public security integration (storefront)
export interface PublicSecurityIntegration {
  active: boolean
  options: PublicSecurityOptions
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

/**
 * Payment method configuration (includes sensitive data like API keys)
 */
export interface PaymentMethodConfig {
  id: string // Slug identifier (e.g., 'chargily', 'paypal')
  name: string // Display name (e.g., 'Chargily Pay', 'PayPal')
  active: boolean
  // Method-specific configuration
  apiKey?: string // For Chargily
  clientId?: string // For PayPal, Stripe, etc.
  clientSecret?: string // For PayPal, Stripe, etc.
  [key: string]: any // Allow other method-specific fields
}

/**
 * Payment integration configuration
 */
export interface PaymentIntegration {
  active: boolean
  methods: PaymentMethodConfig[]
  defaultMethod?: string // Method ID to use by default
  metadata?: Record<string, any>
}

/**
 * Orders dispatch strategy for assigning orders to confirmers.
 * Discriminated union by `type` (freezed convention with unionKey: 'type').
 * Values match Dart constructor names.
 */
export type OrdersDispatchStrategy =
  | { type: 'firstUpdate' }
  | { type: 'random' }
  | {
      type: 'weightedRandom'
      weights?: Record<string, number>
    }
  | {
      type: 'roundRobin'
      lastAssignedConfirmerId?: string
      sortBy?: string
    }
  | { type: 'manualOnly' }
  | {
      type: 'priority'
      confirmerIds: string[]
    }

/**
 * Dispatcher integration configuration.
 * Controls how new orders are assigned to confirmers.
 */
export interface DispatcherIntegration {
  active: boolean
  strategy?: OrdersDispatchStrategy | null
  metadata?: Record<string, any>
}

/**
 * Confirmer-specific permissions (in StoreMember.metadata).
 */
export interface ConfermerPermissions {
  canSeeAllOrders?: boolean
  canAssignOrder?: boolean
  canReAssignOrder?: boolean
  metadata?: Record<string, any>
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
  clarity?: ClarityIntegration
  ai?: AiIntegration
  orderdz?: OrderdzIntegration
  webhooks?: WebhooksIntegration
  payment?: PaymentIntegration

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
  zrexpress?: ZrexpressIntegration

  security?: SecurityIntegration
  dispatcher?: DispatcherIntegration
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
