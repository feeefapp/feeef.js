/**
 * Product Landing Page Template entity
 */

export interface ProductLandingPageTemplate {
  id: string
  name: string | null
  description: string | null
  imageUrl: string | null
  schema: Record<string, any>
  defaults: Record<string, any>
  createdAt: string
  updatedAt: string | null
}

export interface ProductLandingPageTemplateCreate {
  name: string | null
  description: string | null
  imageUrl: string | null
  schema: Record<string, any>
  defaults: Record<string, any>
}

export interface ProductLandingPageTemplateUpdate {
  name: string | null
  description: string | null
  imageUrl: string | null
  schema: Record<string, any>
  defaults: Record<string, any>
}
