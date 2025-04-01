import { EmbaddedCategory } from '../embadded/category.js'
import { ShippingMethodEntity } from './shipping_method.js'
import { StoreEntity } from './store.js'

export interface ProductEntity {
  id: string

  slug: string

  decoration: ProductDecoration | null

  name: string | null

  photoUrl: string | null

  media: string[]

  storeId: string

  shippingMethodId?: string | null

  category: EmbaddedCategory

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

  // relations
  store?: StoreEntity | null
  shippingMethod?: ShippingMethodEntity | null
}

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
