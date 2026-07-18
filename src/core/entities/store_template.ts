/**
 * Full-site template package (per-store `store_templates` row).
 *
 * Multi-page `data` (TemplateData-shaped) plus `schema` (TemplateSchema-shaped).
 * Same policy/version/catalog patterns as template components, without component `code`.
 */
import { TemplateComponentPolicy } from './template_component.js'

/** Reuse the same wire values as `template_components` (`store_templates_policy` matches). */
export { TemplateComponentPolicy as StoreTemplatePolicy } from './template_component.js'

export interface StoreTemplateEntity {
  id: string
  storeId: string
  userId: string

  title: string
  subtitle: string | null
  body: string | null
  category: string | null
  tags: string[]
  imageUrl: string | null
  screenshots: string[]
  demoUrl: string | null

  price: number
  discount: number | null
  license: string | null

  /** TemplateSchema-shaped editor/storefront contract. */
  schema: Record<string, unknown>
  /** TemplateData-shaped site instance data (mirrors `Store.metadata.templateData` when active). */
  data: Record<string, unknown>

  policy: TemplateComponentPolicy
  parentId: string | null
  version: number

  /** Marketplace enrichment (when `storeId` query is sent). */
  owned?: boolean
  effectivePrice?: number
  updateAvailable?: boolean
  installedReleaseId?: string | null
  latestRelease?: StoreTemplateReleaseEntity | null
  ratingAvg?: number
  ratingCount?: number
  featured?: boolean
  salesClosed?: boolean
  moderationStatus?: 'approved' | 'pending' | 'rejected'

  createdAt: any
  updatedAt: any | null
  deletedAt: any | null
}

/** Immutable published snapshot (`store_template_releases`). */
export interface StoreTemplateReleaseEntity {
  id: string
  storeTemplateId: string
  version: string
  versionCode: number
  changelog: string | null
  schema?: Record<string, unknown>
  data?: Record<string, unknown>
  locales?: Record<string, unknown>
  publishedAt: any
  publishedBy?: string | null
  createdAt?: any
  updatedAt?: any | null
}

export interface StoreTemplatePurchaseResult {
  license: Record<string, unknown>
  created: boolean
  storeTemplate: StoreTemplateEntity
}

export interface StoreTemplateReleaseCreateInput {
  version?: string
  changelog?: string | null
  schema?: Record<string, unknown>
  data?: Record<string, unknown>
}

export interface StoreTemplateCreateInput {
  title: string
  schema?: Record<string, unknown>
  data?: Record<string, unknown>
  policy?: TemplateComponentPolicy

  subtitle?: string | null
  body?: string | null
  category?: string | null
  tags?: string[]
  imageUrl?: string | null
  screenshots?: string[]
  demoUrl?: string | null
  price?: number
  discount?: number | null
  license?: string | null
  parentId?: string | null
  salesClosed?: boolean
}

export interface StoreTemplateUpdateInput {
  title?: string
  subtitle?: string | null
  body?: string | null
  category?: string | null
  tags?: string[]
  imageUrl?: string | null
  screenshots?: string[]
  demoUrl?: string | null
  price?: number
  discount?: number | null
  license?: string | null
  schema?: Record<string, unknown>
  data?: Record<string, unknown>
  policy?: TemplateComponentPolicy
  /** Author can close sales; `featured` / `moderationStatus` remain admin-only. */
  salesClosed?: boolean
}

/** One row in `store_template_locales`. */
export interface StoreTemplateLocaleEntity {
  id: string
  storeTemplateId: string
  locale: string
  messages: Record<string, unknown>
  isDefault: boolean
  createdAt?: unknown
  updatedAt?: unknown | null
}

export interface StoreTemplateLocaleInput {
  locale: string
  messages: Record<string, unknown>
  isDefault?: boolean
}

/** Storefront-friendly i18n bundle from GET/PUT locales. */
export interface StoreTemplateLocalesBundle {
  defaultLocale: string
  locales: string[]
  messages: Record<string, Record<string, unknown>>
  rows?: StoreTemplateLocaleEntity[]
}
