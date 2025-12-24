import { EmbaddedCategory } from '../embadded/category.js'
import { ShippingMethodEntity } from './shipping_method.js'
import { GoogleSheetsColumn, StoreEntity } from './store.js'
import { CategoryEntity } from './category.js'

export interface ProductEntity {
  id: string

  slug: string

  decoration: ProductDecoration | null

  name: string | null

  photoUrl: string | null

  media: string[]

  storeId: string

  shippingMethodId?: string | null

  shippingPriceId?: string | null

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

  variant?: ProductVariant | null

  offers?: ProductOffer[] | null

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
  const { metaPixelData, tiktokPixelData, googleAnalyticsData, googleTagsData } = data
  return {
    metaPixelData: generatePublicIntegrationsDataMetaPixel(metaPixelData),
    tiktokPixelData: generatePublicIntegrationsDataTiktokPixel(tiktokPixelData),
    googleAnalyticsData: generatePublicIntegrationsDataGoogleAnalytics(googleAnalyticsData),
    googleTagsData: generatePublicIntegrationsDataGoogleTag(googleTagsData),
  }
}
// function that generate public data from the meta pixel data
export function generatePublicIntegrationsDataMetaPixel(
  data: MetaPixelData | null | undefined
): PublicMetaPixelData | null | undefined {
  if (!data) return data
  const { ids, objective, draftObjective } = data
  return {
    ids: ids,
    objective,
    draftObjective,
  }
}
// function that generate public data from the tiktok pixel data
export function generatePublicIntegrationsDataTiktokPixel(
  data: TiktokPixelData | null | undefined
): PublicTiktokPixelData | null | undefined {
  if (!data) return data
  const { ids, objective, draftObjective } = data
  return {
    ids: ids,
    objective,
    draftObjective,
  }
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
  googleAnalyticsData?: GoogleAnalyticsData | null
  googleTagsData?: GoogleTagData | null
  googleSheetsData?: GoogleSheetsData | null
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
  // active meta pixel ids
  ids: string[] | null
  // main objective
  objective: MetaPixelEvent | null
  // draft objective
  draftObjective: MetaPixelEvent | null
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
  // active tiktok pixel ids
  ids: string[] | null
  // main objective
  objective: TiktokPixelEvent | null
  // draft objective
  draftObjective: TiktokPixelEvent | null
}
export interface GoogleAnalyticsData {}
export interface GoogleTagData {}
export interface GoogleSheetsData {
  enabled: boolean
  // use cant use both sheetId and sheetName
  sheetId: string | null
  // if sheetId is null, use sheetName
  // if sheetName not exists in the spreadsheet, create it
  sheetName: string | null
  spreadsheetId: string | null
  // the next row to insert data
  nextRow: number | null
  // columns to insert data
  columns: GoogleSheetsColumn<any>[] | null
}

// public meta pixel data
export interface PublicMetaPixelData {
  ids: string[] | null
  objective: MetaPixelEvent | null
  draftObjective: MetaPixelEvent | null
}
// public tiktok pixel data
export interface PublicTiktokPixelData {
  ids: string[] | null
  objective: TiktokPixelEvent | null
  draftObjective: TiktokPixelEvent | null
}
// public google analytics data
export interface PublicGoogleAnalyticsData {}
// public google tag data
export interface PublicGoogleTagData {}
// public google sheets data
export interface PublicGoogleSheetsData {}

export interface ProductAddon {
  photoUrl?: string
  title: string
  subtitle?: string
  stock?: number
  price?: number
  min?: number
  max?: number
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
  subtitle?: string
  price?: number
  minQuantity?: number
  maxQuantity?: number
  freeShipping?: boolean
}
