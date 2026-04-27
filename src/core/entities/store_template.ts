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

  createdAt: any
  updatedAt: any | null
  deletedAt: any | null
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
}
