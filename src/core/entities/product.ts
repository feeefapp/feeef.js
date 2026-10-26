import { type EmbaddedCategory } from '../embadded/category.js'
import { type ShippingMethodEntity } from './shipping_method.js'
import { type GoogleSheetsColumn, type StoreEntity } from './store.js'
import { pixelCheckoutEvents, type PixelEventPlatform, type PixelEvents } from './pixel_events.js'
import { type CategoryEntity } from './category.js'

export interface ProductEntity {
  id: string

  slug: string

  decoration: ProductDecoration | null

  name: string | null

  photoUrl: string | null

  media: string[]

  storeId: string

  shippingMethodId?: string | null

  /**
   * Cloud shipping fee override: `ca_…` or `unassigned`.
   * Quoted by the backend — not a legacy `shipping_prices` id.
   */
  shippingFeeId?: string | null

  categoryId?: string | null

  category?: EmbaddedCategory | null

  categoryRelation?: CategoryEntity | null

  title: string | null

  description: string | null

  body: string | null

  // sku
  sku: string | null

  price: number

  cost: number | null

  discount: number | null

  stock: number | null

  sold: number

  views: number

  likes: number

  dislikes: number
  /** Verified-buyer stars only (docs/product-reviews.md). 0 when there are no verified reviews. */
  ratingAvg?: number
  ratingCount?: number
  ratingHistogram?: { '1': number; '2': number; '3': number; '4': number; '5': number }
  /** AI "what customers say"; null until the merchant generates one. */
  reviewSummary?: import('./review.js').ReviewSummaryEntity | null

  variant?: ProductVariant | null

  offers?: ProductOffer[] | null

  /**
   * When true, the customer must keep an offer selected.
   * If [defaultOfferCode] also resolves to a valid offer, that offer is locked
   * (cannot switch or deselect). Independent of [defaultOfferCode] being set.
   */
  forceOffer?: boolean | null

  /**
   * Offer code to preselect on the storefront. Cleared (synced to null) when the
   * code is missing from [offers] — callers should treat a stale code as unset.
   */
  defaultOfferCode?: string | null

  metadata: Record<string, any>

  status: ProductStatus

  type: ProductType

  verifiedAt: any | null

  blockedAt: any | null

  createdAt: any

  updatedAt: any

  addons?: ProductAddon[] | null

  // integrations configs
  integrationsData?: IntegrationsData | null
  publicIntegrationsData?: IntegrationsData | null

  // relations
  store?: StoreEntity | null
  shippingMethod?: ShippingMethodEntity | null
}

// function that generate public data from the integrations data
export function generatePublicIntegrationsData(data: IntegrationsData | null | null): any {
  if (!data) return data
  const {
    metaPixelData,
    tiktokPixelData,
    snapchatPixelData,
    googleAnalyticsData,
    googleTagsData,
    paymentMethodData,
    pixelEvents,
  } = data
  return {
    metaPixelData: generatePublicIntegrationsDataMetaPixel(metaPixelData, pixelEvents?.rules),
    tiktokPixelData: generatePublicIntegrationsDataTiktokPixel(tiktokPixelData, pixelEvents?.rules),
    snapchatPixelData: generatePublicIntegrationsDataSnapchatPixel(
      snapchatPixelData,
      pixelEvents?.rules
    ),
    googleAnalyticsData: generatePublicIntegrationsDataGoogleAnalytics(googleAnalyticsData),
    googleTagsData: generatePublicIntegrationsDataGoogleTag(googleTagsData),
    paymentMethodData: generatePublicIntegrationsDataPaymentMethod(paymentMethodData),
  }
}

/** A product's public pixel data: on/off, pixels, and its own checkout events (null = the store's). */
function publicProductPixelData(
  data: { enabled?: boolean | null; ids?: string[] | null } | null | undefined,
  rules: PixelEvents['rules'] | null | undefined,
  platform: PixelEventPlatform
) {
  const events = rules ? pixelCheckoutEvents(rules, platform) : null
  if (!data && !events) return null
  return {
    enabled: data ? data.enabled !== false : true,
    ids: data?.ids ?? null,
    objective: events?.open ?? null,
    draftObjective: events?.draft ?? null,
  }
}
// function that generate public data from the meta pixel data
export function generatePublicIntegrationsDataMetaPixel(
  data: MetaPixelData | null | undefined,
  rules?: PixelEvents['rules'] | null
): PublicMetaPixelData | null | undefined {
  return publicProductPixelData(data, rules, 'meta')
}
// function that generate public data from the tiktok pixel data
export function generatePublicIntegrationsDataTiktokPixel(
  data: TiktokPixelData | null | undefined,
  rules?: PixelEvents['rules'] | null
): PublicTiktokPixelData | null | undefined {
  return publicProductPixelData(data, rules, 'tiktok')
}

/** Public product Snap Pixel override. Status rules stay merchant-only. */
export function generatePublicIntegrationsDataSnapchatPixel(
  data: SnapchatPixelData | null | undefined,
  rules?: PixelEvents['rules'] | null
): PublicSnapchatPixelData | null | undefined {
  return publicProductPixelData(data, rules, 'snapchat')
}
// function that generate public data from the google analytics data
export function generatePublicIntegrationsDataGoogleAnalytics(
  data: GoogleAnalyticsData | null | undefined
): PublicGoogleAnalyticsData | null | undefined {
  if (!data) return data
  return {}
}
// function that generate public data from the google tag data
export function generatePublicIntegrationsDataGoogleTag(
  data: GoogleTagData | null | undefined
): PublicGoogleTagData | null | undefined {
  if (!data) return data
  return {}
}
// function that generate public data from the google sheets data
export function generatePublicIntegrationsDataGoogleSheets(
  data: GoogleSheetsData | null | undefined
): PublicGoogleSheetsData | null | undefined {
  if (!data) return data
  return {}
}

export interface IntegrationsData {
  metaPixelData?: MetaPixelData | null
  tiktokPixelData?: TiktokPixelData | null
  snapchatPixelData?: SnapchatPixelData | null
  /** This product's own ad pixel event rules (its single-product orders); null = the store's. */
  pixelEvents?: PixelEvents | null
  googleAnalyticsData?: GoogleAnalyticsData | null
  googleTagsData?: GoogleTagData | null
  googleSheetsData?: GoogleSheetsData | null
  paymentMethodData?: PaymentMethodData | null
  /** Merchant-only Ecotrack warehouse stock mapping — never public. */
  ecotrackData?: EcotrackData | null
  /** Product override of review settings (docs/product-reviews.md §5). */
  reviewsData?: import('./review.js').ProductReviewsData | null
  /** Product override of order custom fields (contract v2). */
  customFieldsData?: {
    useProductFields?: boolean
    fields?: import('../custom_fields.js').CustomField[]
  } | null
}

/**
 * Per-product Ecotrack stock mapping.
 * When `stock: 1`, Ecotrack `produit` must be the warehouse product reference.
 */
export interface EcotrackData {
  enabled?: boolean | null
  /** Default Ecotrack stock product reference. */
  produit?: string | null
  /** Feeef inventory SKU → Ecotrack stock `produit` reference. */
  skuProduitMap?: Record<string, string> | null
}

export enum MetaPixelEvent {
  none = 'none',
  lead = 'Lead',
  purchase = 'Purchase',
  viewContent = 'ViewContent',
  addToCart = 'AddToCart',
  initiateCheckout = 'InitiateCheckout',
}
export interface MetaPixelData {
  /** When false, this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean | null
  // active meta pixel ids
  ids?: string[] | null
}

export enum TiktokPixelEvent {
  none = 'none',
  viewContent = 'ViewContent',
  addToWishlist = 'AddToWishlist',
  search = 'Search',
  addPaymentInfo = 'AddPaymentInfo',
  addToCart = 'AddToCart',
  initiateCheckout = 'InitiateCheckout',
  placeAnOrder = 'PlaceAnOrder',
  completeRegistration = 'CompleteRegistration',
  purchase = 'Purchase',
}
export interface TiktokPixelData {
  /** When false, this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean | null
  // active tiktok pixel ids
  ids?: string[] | null
}

/**
 * Snap standard events used by Feeef.
 * Values are the Conversions API / Snap Pixel names (`PURCHASE`, `START_CHECKOUT`, …).
 * `none` skips the send.
 */
export enum SnapchatPixelEvent {
  none = 'none',
  pageView = 'PAGE_VIEW',
  viewContent = 'VIEW_CONTENT',
  addCart = 'ADD_CART',
  startCheckout = 'START_CHECKOUT',
  signUp = 'SIGN_UP',
  addToWishlist = 'ADD_TO_WISHLIST',
  search = 'SEARCH',
  purchase = 'PURCHASE',
}

export interface SnapchatPixelData {
  /** When false, this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean | null
  ids?: string[] | null
}
export interface GoogleAnalyticsData {}
export interface GoogleTagData {}
export interface GoogleSheetsData {
  enabled: boolean
  // use cant use both sheetId and sheetName
  sheetId?: string | null
  // if sheetId is null, use sheetName
  // if sheetName not exists in the spreadsheet, create it
  sheetName?: string | null
  spreadsheetId?: string | null
  // the next row to insert data
  nextRow?: number | null
  // columns to insert data
  columns?: Partial<GoogleSheetsColumn<any>>[] | null
}

// public meta pixel data
export interface PublicMetaPixelData {
  /** False: this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean
  ids?: string[] | null
  objective?: string | null
  draftObjective?: string | null
}
// public tiktok pixel data
export interface PublicTiktokPixelData {
  /** False: this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean
  ids?: string[] | null
  objective?: string | null
  draftObjective?: string | null
}
export interface PublicSnapchatPixelData {
  /** False: this product's orders go to none of the store's pixels on this platform. */
  enabled?: boolean
  ids?: string[] | null
  objective?: string | null
  draftObjective?: string | null
}
// public google analytics data
export interface PublicGoogleAnalyticsData {}
// public google tag data
export interface PublicGoogleTagData {}
// public google sheets data
export interface PublicGoogleSheetsData {}

/**
 * Payment method data for product-level override
 */
export interface PaymentMethodData {
  methodIds?: string[] // Which payment method IDs to use (optional, falls back to store defaults)
  enabled: boolean
}

/**
 * Public payment method data (same structure, no sensitive data)
 */
export interface PublicPaymentMethodData {
  methodIds?: string[]
  enabled: boolean
}

// function that generate public data from the payment method data
export function generatePublicIntegrationsDataPaymentMethod(
  data: PaymentMethodData | null | undefined
): PublicPaymentMethodData | null | undefined {
  if (!data) return data
  return {
    methodIds: data.methodIds,
    enabled: data.enabled,
  }
}

export interface ProductAddon {
  photoUrl?: string | null
  title: string
  subtitle?: string | null
  /** Inventory bucket SKU (scoped under product root when inventory is enabled). */
  sku?: string | null
  stock?: number | null
  price?: number | null
  min?: number | null
  max?: number | null
}

export enum ProductStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
  deleted = 'deleted',
}

export interface ProductDecoration {
  metadata: Record<string, any>
}

export interface ProductVariant {
  name: string
  view?: ProductVariantView
  options: ProductVariantOption[]
  required?: boolean
}

export enum ProductVariantView {
  list = 'list',
  chips = 'chips',
  dropdown = 'dropdown',
}

export interface ProductVariantOption {
  name: string
  sku?: string | null
  price?: number | null
  discount?: number | null
  stock?: number | null
  sold?: number | null
  type?: VariantOptionType
  child?: ProductVariant | null
  mediaIndex?: number | null
  hint?: string | null
  value?: any
  mediaId?: string | null
  hidden?: boolean
}

export enum VariantOptionType {
  color = 'color',
  image = 'image',
  text = 'text',
}

export enum ProductType {
  physical = 'physical',
  digital = 'digital',
  service = 'service',
}

export interface ProductOffer {
  code: string
  title: string
  subtitle?: string | null
  /** Unit price override; API may emit `null` when unset. */
  price?: number | null
  /** Minimum qty for this offer; API may emit `null` when unset. */
  minQuantity?: number | null
  /** Maximum qty for this offer; API may emit `null` when unset. */
  maxQuantity?: number | null
  freeShipping?: boolean | null
}

/**
 * Input data for creating a new product
 */
export interface ProductCreateInput {
  name: string
  storeId: string
  slug?: string
  photoUrl?: string
  media?: string[]
  shippingMethodId?: string
  shippingFeeId?: string
  categoryId?: string
  category?: EmbaddedCategory
  title?: string
  description?: string
  body?: string
  sku?: string
  price: number
  cost?: number
  discount?: number
  stock?: number
  variant?: ProductVariant
  offers?: ProductOffer[]
  /** See [ProductEntity.forceOffer]. */
  forceOffer?: boolean | null
  /** See [ProductEntity.defaultOfferCode]. */
  defaultOfferCode?: string | null
  addons?: ProductAddon[]
  metadata?: Record<string, any>
  status?: ProductStatus
  type?: ProductType
  decoration?: ProductDecoration
  integrationsData?: IntegrationsData
}

/**
 * Input data for updating an existing product
 */
export interface ProductUpdateInput {
  name?: string
  slug?: string
  photoUrl?: string
  media?: string[]
  shippingMethodId?: string
  shippingFeeId?: string
  categoryId?: string
  category?: EmbaddedCategory
  title?: string
  description?: string
  body?: string
  sku?: string
  price?: number
  cost?: number
  discount?: number
  stock?: number
  variant?: ProductVariant
  offers?: ProductOffer[]
  /** See [ProductEntity.forceOffer]. */
  forceOffer?: boolean | null
  /** See [ProductEntity.defaultOfferCode]. */
  defaultOfferCode?: string | null
  addons?: ProductAddon[]
  metadata?: Record<string, any>
  status?: ProductStatus
  type?: ProductType
  decoration?: ProductDecoration
  integrationsData?: IntegrationsData
  /** Moderation (admin): ISO date to verify, null to unverify. */
  verifiedAt?: string | null
  /** Moderation (admin): ISO date to block, null to unblock. */
  blockedAt?: string | null
}

/**
 * Product report/analytics data
 */
export interface ProductReport {
  views: number
  likes: number
  dislikes: number
  sold: number
  revenue: number
  conversionRate: number
  averageOrderValue: number
  topVariants?: Array<{ path: string; sold: number }>
  salesByDate?: Record<string, number>
}

/** Token for `Order.references`. */
export function formatProductOrderReference(productId: string): string {
  return `product:${productId}`
}
