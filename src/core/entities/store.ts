import type { CustomFieldType, CustomFieldVisibility, FileKind } from '../custom_fields.js'
import { type EmbaddedAddress } from '../embadded/address.js'
import { type EmbaddedCategory } from '../embadded/category.js'
import { type EmbaddedContact } from '../embadded/contact.js'
import { type OrderEntity } from './order.js'
import { type MetaPixelEvent, type SnapchatPixelEvent, type TiktokPixelEvent } from './product.js'
// import { OrderEntity } from "./order.js";
// import { ShippingMethodEntity } from "./shipping_method.js";
import { type UserEntity } from './user.js'
import { type CategoryEntity } from './category.js'
import { type DateTime } from 'luxon'

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

  /**
   * Default Cloud shipping fee: `ca_…` (carrier account) or `unassigned`
   * (project fees). Quoted by the backend — not a legacy `shipping_prices` id.
   */
  shippingFeeId?: string | null

  // subscription
  subscription?: any
  due?: number

  // StoreConfigs
  configs?: StoreConfigs

  // metaPixelIds
  metaPixelIds?: string[] | null

  // tiktokPixelIds
  tiktokPixelIds?: string[] | null

  // snapchatPixelIds
  snapchatPixelIds?: string[] | null

  // googleAnalyticsId
  googleAnalyticsId?: string | null

  // googleTagsId
  googleTagsId?: string | null

  // members
  members?: Record<string, StoreMember>

  /** Live template version (`package_versions.id`). */
  templateVersionId?: string | null

  /** Linked inventory project ID for stock management. */
  projectId?: string | null
}

// function that generate public data from the integrations data
export const generatePublicStoreIntegrations = (
  integrations: StoreIntegrations | null | undefined,
  /**
   * Optional store configs — used to expose inventory storefront flags
   * (`show_unavailable_on_frontend`) on {@link PublicInventoryIntegration}.
   */
  configs?: Pick<StoreConfigs, 'inventory_integration'> | StoreConfigs | null
): PublicStoreIntegrations | null => {
  if (!integrations) return null
  const {
    meta,
    metaPixel,
    tiktokPixel,
    snapchatPixel,
    googleAnalytics,
    googleTags,
    clarity,
    orderdz,
    webhooks,
    ai,
    security,
    customFields,
    reviews,
    payment,
    connectors,
    inventory,
  } = integrations
  return {
    meta: generatePublicStoreIntegrationMeta(meta),
    metaPixel: generatePublicStoreIntegrationMetaPixel(metaPixel) || null,
    tiktokPixel: generatePublicStoreIntegrationTiktokPixel(tiktokPixel) || null,
    snapchatPixel: generatePublicStoreIntegrationSnapchatPixel(snapchatPixel) || null,
    googleAnalytics: generatePublicStoreIntegrationGoogleAnalytics(googleAnalytics) || null,
    googleTags: generatePublicStoreIntegrationGoogleTags(googleTags) || null,
    clarity: generatePublicStoreIntegrationClarity(clarity) || null,
    googleSheet: null,
    ai: generatePublicStoreIntegrationAi(ai) || null,
    orderdz: generatePublicStoreIntegrationOrderdz(orderdz) || null,
    webhooks: generatePublicStoreIntegrationWebhooks(webhooks) || null,
    security: generatePublicStoreIntegrationSecurity(security) || null,
    customFields: generatePublicStoreIntegrationCustomFields(customFields) || null,
    reviews: generatePublicStoreIntegrationReviews(reviews),
    payment: generatePublicStoreIntegrationPayment(payment) || null,
    connectors: generatePublicStoreIntegrationConnectors(connectors) || null,
    inventory:
      generatePublicStoreIntegrationInventory(inventory, {
        showUnavailableOnFrontend:
          configs?.inventory_integration?.show_unavailable_on_frontend === true,
      }) || null,
  }
}

/**
 * Public inventory module (no project credentials).
 * Storefront OOS UI runs only when `active` and `showUnavailableOnFrontend`.
 */
export const generatePublicStoreIntegrationInventory = (
  inventory: StoreInventoryIntegration | null | undefined,
  options?: { showUnavailableOnFrontend?: boolean }
): PublicInventoryIntegration | null | undefined => {
  if (!inventory) return null
  return {
    active: inventory.active === true,
    showUnavailableOnFrontend: options?.showUnavailableOnFrontend === true,
  }
}

/** Strips connector auth secrets from public store JSON. */
export const generatePublicStoreIntegrationConnectors = (
  connectors: ConnectorsIntegration | null | undefined
): PublicConnectorsIntegration | null | undefined => {
  if (!connectors) return null
  return {
    active: connectors.active,
    metadata: connectors.metadata,
    connectors: (connectors.connectors || []).map((c) => ({
      id: c.id,
      type: c.type,
      active: c.active,
      name: c.name,
      status: c.status,
      externalId: c.externalId,
      fieldMapping: c.fieldMapping,
      syncState: c.syncState,
      createdAt: c.createdAt,
      metadata: c.metadata,
    })),
  }
}

export interface PublicReviewsIntegration {
  active: boolean
  storefrontForm: boolean
}

/** Store-level public review switches. Null when the store never configured reviews (default on). */
export const generatePublicStoreIntegrationReviews = (
  reviews: any | null | undefined
): PublicReviewsIntegration => ({
  active: reviews?.active !== false,
  storefrontForm: reviews?.active !== false && reviews?.storefrontForm === true,
})

export const generatePublicStoreIntegrationCustomFields = (
  customFields: any | null | undefined
): PublicCustomFieldsIntegration | null | undefined => {
  if (!customFields || !customFields.active) return null
  return {
    fields: (customFields.fields || [])
      .filter((field: any) => field && field.active !== false)
      .map((field: any) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        multiple: field.multiple,
        minCount: field.minCount,
        maxCount: field.maxCount,
        placeholder: field.placeholder,
        helpText: field.helpText,
        minLength: field.minLength,
        maxLength: field.maxLength,
        regexPattern: field.regexPattern,
        min: field.min,
        max: field.max,
        integer: field.integer,
        options: field.options,
        accept: field.accept,
        visibility: field.visibility,
        defaultValue: field.defaultValue,
        order: field.order,
        active: field.active,
      })),
    active: customFields.active,
  }
}
/**
 * True when a CAPI key / access token is set (same test as the backend's
 * hasPixelKey / hasPixelAccessToken). Never exposes the value.
 */
const hasSecret = (v: string | null | undefined): boolean => !!(v && String(v).trim().length > 0)

/**
 * Generates public Meta Pixel integration data from private integration data.
 * Only exposes non-sensitive information (pixel IDs, active status, objectives).
 * Sensitive data like oauth2 tokens, pixel API keys, and metadata are NOT exposed.
 */
export const generatePublicStoreIntegrationMetaPixel = (
  metaPixel: MetaPixelIntegration | null | undefined
): PublicMetaPixelIntegration | null | undefined => {
  if (!metaPixel) return null
  // NOTE: oauth2, pixel.key, and metadata are intentionally excluded for security.
  // `capi` only says whether a key is set (never the key), so the storefront
  // knows whether the server can send this pixel's order conversions.
  return {
    pixels: (metaPixel.pixels || []).map((pixel) => ({
      id: pixel.id,
      capi: hasSecret(pixel.key),
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
    pixels: (tiktokPixel.pixels || []).map((pixel) => ({
      id: pixel.id,
      capi: hasSecret(pixel.accessToken),
    })),
    active: tiktokPixel.active,
    objective: tiktokPixel.objective,
    draftObjective: tiktokPixel.draftObjective,
    mode: tiktokPixel.mode,
  }
}

/**
 * Public Snap Pixel config. CAPI access tokens are never included.
 */
export const generatePublicStoreIntegrationSnapchatPixel = (
  snapchatPixel: SnapchatPixelIntegration | null | undefined
): PublicSnapchatPixelIntegration | null | undefined => {
  if (!snapchatPixel) return null
  return {
    pixels: (snapchatPixel.pixels || []).map((pixel) => ({
      id: pixel.id,
      capi: hasSecret(pixel.accessToken),
    })),
    active: snapchatPixel.active,
    objective: snapchatPixel.objective,
    draftObjective: snapchatPixel.draftObjective,
    mode: snapchatPixel.mode,
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

  const webhookList = webhooks.webhooks ?? []
  const activeWebhooks = webhookList.filter((webhook) => webhook.active)

  return {
    webhookCount: webhookList.length,
    activeWebhookCount: activeWebhooks.length,
    active: webhooks.active,
    webhookUrls: activeWebhooks.map((webhook) => webhook.url),
  }
}
const DUPLICATE_WINDOW_DEFAULT_S = 3600
const COOLDOWN_DEFAULT_MS = 3_000
/** The client lock is UX only; never publish the server cooldown itself. */
const COOLDOWN_MAX_MS = 60_000

const positiveSeconds = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0

/**
 * Generates the public (storefront) security knobs from the private config.
 *
 * Only numbers the browser needs to run its own cheap checks; no rule names,
 * no outcomes, no lists. Everything else (countries, sources, fingerprint,
 * ip, phone, ads, and what happens when a check trips) stays on the API,
 * which enforces it on `POST /orders/send`. Null when security is off.
 */
export const generatePublicStoreIntegrationSecurity = (
  security: SecurityIntegration | null | undefined
): PublicSecurityIntegration | null => {
  if (!security || security.active !== true) return null

  const opts = security.options
  const minTime = opts?.minTimeInPage
  const frontend = opts?.frontend
  const doubleSend = opts?.doubleSend

  return {
    minTimeMs: minTime?.active === true ? Math.round(positiveSeconds(minTime.duration) * 1000) : 0,
    duplicateWindowMs:
      frontend?.active === true
        ? Math.round((positiveSeconds(frontend.ttl) || DUPLICATE_WINDOW_DEFAULT_S) * 1000)
        : 0,
    submitCooldownMs:
      doubleSend?.active === true
        ? Math.min(
            positiveSeconds(doubleSend.ttl)
              ? Math.round(positiveSeconds(doubleSend.ttl) * 1000)
              : COOLDOWN_DEFAULT_MS,
            COOLDOWN_MAX_MS
          )
        : 0,
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

/**
 * A public pixel entry. `capi` is true when the pixel has a Conversions API
 * key/token, i.e. the server can send its order conversions (unless the mode
 * is `client`). The storefront sends the conversion from the browser for
 * pixels where it is false or missing.
 */
export interface PublicPixelEntry {
  id: string
  capi?: boolean
}
export interface PublicMetaPixelIntegration {
  pixels: PublicPixelEntry[]
  active: boolean
  objective?: MetaPixelEvent | null
  draftObjective?: MetaPixelEvent | null
  mode?: PixelReportMode | null
}
export interface PublicTiktokPixelIntegration {
  pixels: PublicPixelEntry[]
  active: boolean
  objective?: TiktokPixelEvent | null
  draftObjective?: TiktokPixelEvent | null
  mode?: PixelReportMode | null
}
export interface PublicSnapchatPixelIntegration {
  pixels: PublicPixelEntry[]
  active: boolean
  objective?: SnapchatPixelEvent | null
  draftObjective?: SnapchatPixelEvent | null
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

/**
 * Public custom field definition — contract v2 (`docs/custom-fields.md`).
 * Use the `customFields` helpers (`visibleCustomFields`, `validateCustomFieldValues`).
 */
export interface PublicCustomField {
  id: string
  label: string
  type: CustomFieldType | string
  required?: boolean
  multiple?: boolean
  minCount?: number | null
  maxCount?: number | null
  placeholder?: string | null
  helpText?: string | null
  minLength?: number | null
  maxLength?: number | null
  regexPattern?: string | null
  min?: number | null
  max?: number | null
  integer?: boolean
  options?: { value: string; label: string }[] | null
  accept?: FileKind[] | null
  visibility?: CustomFieldVisibility | null
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

/**
 * Public inventory module — no project / warehouse secrets.
 * Combined with effective-active (entitlement) on store serialization.
 *
 * Storefront must only fetch/apply OOS when `active && showUnavailableOnFrontend`.
 */
export interface PublicInventoryIntegration {
  active: boolean
  /**
   * When true, storefront shows unavailable variants (live qty / legacy stock).
   * Opt-in via `configs.inventory_integration.show_unavailable_on_frontend`.
   * @default false
   */
  showUnavailableOnFrontend: boolean
}

export interface PublicStoreIntegrations {
  /** Global Meta integration; credentials and ad accounts never included. */
  meta: PublicMetaIntegration | null
  metaPixel: PublicMetaPixelIntegration | null
  tiktokPixel: PublicTiktokPixelIntegration | null
  /** Snap Pixel ids + objectives. CAPI tokens are stripped. */
  snapchatPixel?: PublicSnapchatPixelIntegration | null
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
  /** Product reviews: `active` and `storefrontForm` only (backend-owned, free). */
  reviews: PublicReviewsIntegration | null
  payment: PublicPaymentIntegration | null
  connectors: PublicConnectorsIntegration | null
  /**
   * Inventory module. Storefront OOS checks require `active` and
   * `showUnavailableOnFrontend` (merchant opt-in).
   */
  inventory: PublicInventoryIntegration | null
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
  /**
   * Fine-grained RBAC scopes (e.g. `orders`, `products.read`, `store.integrations`).
   * Empty/undefined = legacy unrestricted access for the member's role.
   * Parent scopes imply `.read` children (`orders` ⇒ `orders.read`).
   */
  scopes?: string[]
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
  /** RBAC scopes copied onto the member when the invite is accepted. */
  scopes?: string[]
}

export interface CreateStoreInviteInput {
  email: string
  role: StoreMemberRole
  expiresAt?: string
  metadata?: Record<string, any>
  /** RBAC scopes to grant on acceptance (see {@link StoreMember.scopes}). */
  scopes?: string[]
}

/** How order sync handles line items with no inventory bucket for their SKU. */
export type MissingInventoryBucketPolicy = 'ignore' | 'reject'

/** First rooms phase that holds stock for an order (default `open`). */
export type InventoryReservePhase = 'open' | 'pack' | 'ship'

/** Rooms phase that turns the hold into a sale (default `done`). */
export type InventoryConsumePhase = 'ship' | 'done'

export interface InventoryIntegration {
  /**
   * Rooms lifecycle. Draft and failed orders (cancelled, returned, …) never
   * hold stock; a failed order after consumption is restocked.
   */
  reserve_from?: InventoryReservePhase
  consume_at?: InventoryConsumePhase
  /**
   * `ignore` — skip untracked SKUs and continue the order save.
   * `reject` — block the order with a stock validation error.
   * @default ignore
   */
  missing_bucket_policy?: MissingInventoryBucketPolicy
  /**
   * When true, reservation may exceed on-hand quantity so availability can go negative.
   * @default true
   */
  allow_backorder?: boolean
  /**
   * When true (and inventory public integration is active), the storefront
   * fetches live availability and marks out-of-stock variants.
   * @default false
   */
  show_unavailable_on_frontend?: boolean
}

export type FinancePdfPaperSize = 'a4' | 'letter' | 'a5' | 'legal'

/** Layout and content options for finance PDF documents. */
export interface FinancePdfSettings {
  paperSize: FinancePdfPaperSize
  showQrCode: boolean
  showLogo: boolean
  showStoreContact: boolean
  showSupplierDetails: boolean
  showDocumentId: boolean
  showFooter: boolean
  showStatusBadge: boolean
  showSignatureLines: boolean
  showPaymentHistory: boolean
  footerNote: string
}

/**
 * Order → finance settings. Revenue + COGS are recognized when an order is
 * closed as done in the rooms model (not configurable).
 */
export interface FinanceIntegration {
  /** Cash-basis metrics cutoff — payments/expenses before this are ignored. */
  activated_at?: string | null
  pdf?: FinancePdfSettings
}

export interface StoreConfigs {
  currencies: StoreCurrencyConfig[]
  selectedCurrency: string
  languages?: StoreLanguageConfig[]
  defaultLanguage?: string
  countries?: StoreCountryConfig[]
  selectedCountry?: string
  confirmationQueue?: ConfirmationQueueConfig
  inventory_integration?: InventoryIntegration
  finance_integration?: FinanceIntegration
}

/** Store-level confirmation queue settings. */
export interface ConfirmationQueueConfig {
  enabled?: boolean
  /**
   * How long a `draft` order must age before it becomes eligible for
   * confirmation. Gives the customer time to finish submitting.
   */
  draftDelayMinutes?: number
  /**
   * After a confirmer skips, how long before the order is due again
   * (`scheduled_at` soft-snooze). Default 15.
   */
  skipDeferMinutes?: number
  /**
   * How long after `updated_at` a recent history order stays correctable
   * in the confirmation feed. Default 5.
   */
  historyActionMinutes?: number
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

/** Which order field to compare for [PixelStatusRule] (server-side CAPI on transition). */
export enum PixelStatusDimension {
  /** Rooms-model phase: draft | open | pack | ship | done | fail. */
  phase = 'phase',
  /** Status catalog kind (or custom status slug). */
  kind = 'kind',
  paymentStatus = 'paymentStatus',
  /** @deprecated Legacy — old saved rules only; the API rejects it on save. Use `phase`. */
  orderStatus = 'orderStatus',
  /** @deprecated Legacy — use `phase` / `kind`. */
  deliveryStatus = 'deliveryStatus',
  /** @deprecated Legacy — use `kind`. */
  customStatus = 'customStatus',
}

/**
 * When the order transitions so `dimension` becomes `equals`, send configured Meta/TikTok server events.
 * `id` must be stable (UUID) — used for idempotency in `order.claims.pixelStatusEvents`.
 */
export interface PixelStatusRule {
  id: string
  dimension: PixelStatusDimension | `${PixelStatusDimension}`
  equals: string
  metaEvent?: MetaPixelEvent | `${MetaPixelEvent}` | keyof typeof MetaPixelEvent | null
  tiktokEvent?: TiktokPixelEvent | `${TiktokPixelEvent}` | keyof typeof TiktokPixelEvent | null
  snapchatEvent?:
    | SnapchatPixelEvent
    | `${SnapchatPixelEvent}`
    | keyof typeof SnapchatPixelEvent
    | 'ADD_BILLING'
    | 'SUBSCRIBE'
    | 'CUSTOM_EVENT_1'
    | 'CUSTOM_EVENT_2'
    | 'CUSTOM_EVENT_3'
    | 'CUSTOM_EVENT_4'
    | 'CUSTOM_EVENT_5'
    | 'addBilling'
    | 'subscribe'
    | null
  /** When set, overrides `metaEvent` (Meta CAPI custom event name). */
  metaCustomEvent?: string | null
  tiktokCustomEvent?: string | null
  /** Overrides `snapchatEvent`. Snap standard name, e.g. `CUSTOM_EVENT_1`. */
  snapchatCustomEvent?: string | null
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

/** One Snap Pixel. `accessToken` is the Conversions API token (server-only). */
export interface SnapchatPixel {
  name?: string
  /** Pixel UUID from Snap Events Manager. */
  id: string
  accessToken?: string
}
/**
 * An ad account the merchant chose to manage from Feeef.
 */
export interface MetaAdAccountRef {
  /** Graph node id, `act_123`. */
  id: string
  /** Bare numeric id, `123`. */
  accountId: string
  name?: string
  currency?: string
  timezoneName?: string
  accountStatus?: number
}

/** Everything ads-related on the Meta integration. */
export interface MetaAdsConfig {
  active?: boolean
  adAccounts?: MetaAdAccountRef[]
  defaultAdAccountId?: string | null
  /** Default insights window for the dashboard, e.g. `last_7d`. */
  defaultDatePreset?: string | null
  /** Extra hosts that count as this store's storefront when matching ad links. */
  extraStoreHosts?: string[]
  metadata?: Record<string, any>
}

/**
 * Meta OAuth credentials.
 *
 * Server-side only — the token is encrypted at rest and written exclusively by
 * the OAuth callback. It is stripped from every client-facing projection, and
 * `mergeIntegrationsPatch` in the backend refuses to accept it from a client.
 */
export interface MetaOAuthCredentials {
  /** AES-encrypted access token. Never present in API responses. */
  accessTokenEnc: string
  tokenType?: string
  expiresAt?: string
  /** Scopes Meta actually granted, from `debug_token`. */
  scopes?: string[]
  connectedAt?: string
  connectedByUserId?: string
  metaUserId?: string
}

/**
 * Global Meta integration (`store.integrations.meta`).
 *
 * Credentials live at the top level and are shared by every Meta feature.
 * Ads live under `ads`; pixels remain on the legacy {@link MetaPixelIntegration}
 * key for now and may move here later.
 */
export interface MetaIntegration {
  active: boolean
  oauth2?: MetaOAuthCredentials | null
  /** Meta identity the token belongs to, for display + reconnect detection. */
  account?: { id: string; name?: string } | null
  ads?: MetaAdsConfig | null
  metadata?: Record<string, any>
}

/** Storefront-safe Meta integration — credentials and ad accounts excluded. */
export interface PublicMetaIntegration {
  active: boolean
  ads: { active: boolean } | null
}

/**
 * Generates public Meta integration data.
 * `oauth2`, `account`, and the ad-account list are intentionally excluded — none
 * of it belongs on a storefront page.
 */
export const generatePublicStoreIntegrationMeta = (
  meta: MetaIntegration | null | undefined
): PublicMetaIntegration | null => {
  if (!meta) return null
  return {
    active: meta.active === true,
    ads: meta.ads ? { active: meta.ads.active === true } : null,
  }
}

// meta pixel integration
export interface MetaPixelIntegration {
  id: string
  pixels: MetaPixel[]
  objective?: MetaPixelEvent | null
  draftObjective?: MetaPixelEvent | null
  /** Server-only lifecycle rules; never exposed on public storefront JSON. */
  statusRules?: PixelStatusRule[]
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
  /** Server-only lifecycle rules; never exposed on public storefront JSON. */
  statusRules?: PixelStatusRule[]
  active: boolean
  metadata: Record<string, any>
  /** Where to send events: server, client, or both. Omit for auto (prefer server if accessToken set). */
  mode?: PixelReportMode | null
}

/** Snap Pixel + Conversions API (`store.integrations.snapchatPixel`). */
export interface SnapchatPixelIntegration {
  id: string
  pixels: SnapchatPixel[]
  objective?: SnapchatPixelEvent | null
  draftObjective?: SnapchatPixelEvent | null
  /** Server-only lifecycle rules; never exposed on public storefront JSON. */
  statusRules?: PixelStatusRule[]
  active: boolean
  metadata: Record<string, any>
  /** Where to send events: server (CAPI), client (snaptr), or both. Omit for auto. */
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
  /**
   * When true, draft (abandoned-cart) orders are written to a dedicated
   * sheet tab (`draftSheetName`) instead of the main tab (`name`).
   * When the order leaves the draft status (e.g. becomes pending), its row is
   * removed from the draft tab and a fresh row is inserted into the main tab.
   * Disabled by default.
   */
  draftSheetEnabled?: boolean
  /**
   * Tab title used for draft orders when `draftSheetEnabled` is true.
   * Falls back to the platform default ("الطلبات المتروكة") when empty.
   */
  draftSheetName?: string | null
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

/**
 * Codpilot mini-ERP — push Feeef orders for confirmation / COD ops.
 *
 * Auth: subdomain + apiId + Bearer apiToken.
 * Docs: https://codpilot.gitbook.io/codpilot-api
 * Sync state: `order.metadata.codpilot` (not a delivery carrier).
 */
export interface CodpilotIntegration {
  /** Business subdomain (`mystore` → mystore.codpilot.net) */
  subdomain: string
  apiId: string
  apiToken: string
  active: boolean
  /**
   * Auto-send when a status dimension transitions into `equals`.
   * Default (client-seeded): `[{ id: 'default-pending', dimension: 'orderStatus', equals: 'pending' }]`.
   */
  statusRules?: Array<{
    id: string
    dimension: 'orderStatus' | 'deliveryStatus' | 'paymentStatus' | 'customStatus'
    equals: string
  }>
  metadata?: Record<string, any>
}

/**
 * MDM Express (api.mdm.express) — `x-api-key` and/or Bearer JWT, MDM store `trackingId` (`mdmStoreId` on orders),
 * and MDM seller id (`mdmSellerId`) for service-fees.
 */
export interface MdmExpressIntegration {
  id: string
  apiKey?: string
  bearerToken?: string
  /** Store tracking id (e.g. STR-…) — `storeId` on `POST /api/v2/orders`. */
  mdmStoreId: string
  /** Seller id (e.g. SLR-…) — `GET /api/sellers/{id}/service-fees`. */
  mdmSellerId?: string
  active: boolean
  silentMode?: boolean
  autoSend?: boolean
  webhookSecret?: string | null
  metadata?: Record<string, any>
}

/**
 * Feeef Delivery (Near Delivery white-label). Merchants never hold Near API keys —
 * enable via `POST .../integrations/feeefDelivery/enable`.
 */
export interface FeeefDeliveryIntegration {
  id: string
  active: boolean
  autoSend?: boolean
  /** Near sender user id — required when active. */
  nearSenderUserId: number
  nearSenderUsername?: string | null
  nearSenderEmail?: string | null
  nearAccountType?: 'platform' | 'api' | 'both' | null
  /** 0 = address pickup, 1 = center pickup. */
  pickupLocationType?: 0 | 1 | null
  pickupAddress?: string | null
  senderCenterId?: number | null
  defaultBuralistId?: number | null
  /** Prefer Feeef-branded PDF labels (default true). */
  useFeeefLabel?: boolean | null
  webhookSecret?: string | null
  metadata?: Record<string, any> | null
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

// Private security integration (merchant app) — checkout fraud / abuse protection
// (not account 2FA). Enforced on public `POST .../orders/send`.
export interface SecurityIntegration {
  active: boolean
  options?: SecurityOptions | null
  metadata?: Record<string, any>
}

/**
 * Public security knobs (storefront). Numbers only, in milliseconds; 0 means
 * the check is off (for `minTimeMs`: the storefront default applies).
 */
export interface PublicSecurityIntegration {
  /** Minimum time the order form is open before a pending submit. */
  minTimeMs: number
  /** How long a repeat of the same order from one browser is held back. */
  duplicateWindowMs: number
  /** How long the browser keeps its in-flight submit lock after a success. */
  submitCooldownMs: number
}

/**
 * Webhook event types for order and product lifecycle
 */
export enum WebhookEvent {
  ORDER_CREATED = 'orderCreated',
  ORDER_UPDATED = 'orderUpdated',
  ORDER_DELETED = 'orderDeleted',
  PRODUCT_CREATED = 'productCreated',
  PRODUCT_UPDATED = 'productUpdated',
  PRODUCT_DELETED = 'productDeleted',
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
 * Webhooks integration configuration for real-time order and product notifications
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

/** Inbound platform connector auth (polymorphic by authType). */
export type ConnectorAuthType = 'oauth2' | 'apiKey' | 'public'

export type ConnectorAuth =
  | {
      authType: 'oauth2'
      accessToken?: string
      refreshToken?: string
      scopes?: string[]
      expiresAt?: string | null
    }
  | { authType: 'apiKey'; apiKey?: string }
  | { authType: 'public'; baseUrl?: string }

export type ConnectorType = 'shopify' | 'youcan' | 'google_sheets' | 'facebook_leads'

export type ConnectorStatus = 'connected' | 'reauth_needed' | 'uninstalled' | 'error'

export interface ConnectorFieldMapping {
  order?: Record<string, string>
  product?: Record<string, string>
}

export interface ConnectorSyncStateEntry {
  cursor?: string | null
  lastSyncedAt?: string | null
}

/** Single linked external platform instance (Shopify shop, YouCan store, etc.). */
export interface ConnectorConfig {
  id: string
  type: ConnectorType
  active: boolean
  name?: string
  status?: ConnectorStatus
  externalId?: string
  fieldMapping?: ConnectorFieldMapping
  syncState?: Record<string, ConnectorSyncStateEntry>
  auth?: ConnectorAuth
  metadata?: Record<string, any>
  createdAt?: string
}

/** Inbound connectors integration (store.integrations.connectors). */
export interface ConnectorsIntegration {
  active: boolean
  connectors: ConnectorConfig[]
  metadata?: Record<string, any>
}

/** Public connector config (auth secrets stripped). */
export interface PublicConnectorConfig {
  id: string
  type: ConnectorType
  active: boolean
  name?: string
  status?: ConnectorStatus
  externalId?: string
  fieldMapping?: ConnectorFieldMapping
  syncState?: Record<string, ConnectorSyncStateEntry>
  createdAt?: string
  metadata?: Record<string, any>
}

export interface PublicConnectorsIntegration {
  active: boolean
  connectors: PublicConnectorConfig[]
  metadata?: Record<string, any>
}

export interface StoreIntegrations {
  [key: string]: any
  metadata?: Record<string, any>

  // @Default('default') String id,
  // @Default([]) List<MetaPixel> pixels,
  // @Default(true) bool active,
  // @Default({}) Map<String, dynamic> metadata,
  /**
   * Global Meta integration — credentials shared by every Meta feature.
   * Ads live here today; pixels may move over from `metaPixel` later.
   */
  meta?: MetaIntegration
  metaPixel?: MetaPixelIntegration
  tiktokPixel?: TiktokPixelIntegration
  snapchatPixel?: SnapchatPixelIntegration
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
  mdmExpress?: MdmExpressIntegration
  /** Feeef Delivery (Near white-label) — no merchant API keys. */
  feeefDelivery?: FeeefDeliveryIntegration
  codpilot?: CodpilotIntegration

  security?: SecurityIntegration
  dispatcher?: DispatcherIntegration
  inventory?: StoreInventoryIntegration
  finance?: StoreFinanceIntegration
  /** Store-owned pages, billed per store. */
  pages?: StorePagesIntegration
  /** Inbound platform connectors (Shopify, YouCan, Google Sheets, …). */
  connectors?: ConnectorsIntegration
}

/** Marketplace inventory module (billing + active toggle). */
export interface StoreInventoryIntegration {
  active: boolean
  metadata?: Record<string, any>
}

/** Store-owned website pages: monthly integration and active toggle. */
export interface StorePagesIntegration {
  active: boolean
  metadata?: Record<string, any>
}

/** Finance module (procurement + accounting) billing + active toggle. */
export interface StoreFinanceIntegration {
  active: boolean
  metadata?: Record<string, any>
}

export enum StoreSubscriptionStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum StoreSubscriptionType {
  free = 'free',
  premium = 'premium',
  vip = 'vip',
  ultra = 'ultra',
  custom = 'custom',
}

/** Per-integration billing lifecycle (stored on store.subscription.integrations). */
export enum IntegrationBillingStatus {
  active = 'active',
  grace = 'grace',
  past_due = 'past_due',
  canceled = 'canceled',
}

export interface StoreIntegrationSubscription {
  startAt: DateTime
  expiresAt: DateTime | null
  status: IntegrationBillingStatus
  /** Price snapshot from last successful charge (DZD). */
  price: number
  autoRenew: boolean
  failedAttempts: number
  nextRetryAt: DateTime | null
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
  /** Per-integration paid subscriptions (billing only; credentials stay in store.integrations). */
  integrations?: Record<string, StoreIntegrationSubscription>
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
  shippingFeeId?: string
  configs?: StoreConfigs
  metaPixelIds?: string[]
  tiktokPixelIds?: string[]
  snapchatPixelIds?: string[]
  googleAnalyticsId?: string
  googleTagsId?: string
  projectId?: string
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
  shippingFeeId?: string
  configs?: StoreConfigs
  metaPixelIds?: string[]
  tiktokPixelIds?: string[]
  snapchatPixelIds?: string[]
  googleAnalyticsId?: string
  googleTagsId?: string
  integrations?: StoreIntegrations
  projectId?: string
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
  /** RBAC scopes to grant (see {@link StoreMember.scopes}). Empty/undefined = unrestricted for the role. */
  scopes?: string[]
}

/**
 * Input for updating a store member
 */
export interface UpdateStoreMemberInput {
  role?: StoreMemberRole
  name?: string
  metadata?: Record<string, any>
  /** Replacement RBAC scopes (see {@link StoreMember.scopes}). Omit to keep current scopes. */
  scopes?: string[]
}
