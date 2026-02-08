/**
 * Product Landing Page entity
 */

import { ProductLandingPageTemplate } from './product_landing_page_template.js'

export interface ProductLandingPage {
  id: string
  name: string | null
  description: string | null
  templateId: string | null
  schema: Record<string, any> | null
  defaults: Record<string, any> | null
  productId: string | null
  storeId: string
  createdAt: string
  updatedAt: string | null
  template?: ProductLandingPageTemplate
  product?: any
  store?: any
}

export interface ProductLandingPageCreate {
  name: string | null
  description: string | null
  templateId: string | null
  schema: Record<string, any> | null
  defaults: Record<string, any> | null
  productId: string | null
  storeId: string
}

export interface ProductLandingPageUpdate {
  name: string | null
  description: string | null
  templateId: string | null
  schema: Record<string, any> | null
  defaults: Record<string, any> | null
  productId: string | null
  storeId?: string
}
