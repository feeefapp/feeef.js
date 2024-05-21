import { OrderEntity } from './order.js'

export interface ShippingMethodEntity {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  ondarkLogoUrl: string | null
  price: number
  forks: number
  sourceId: string
  storeId: string
  rates: (number | null)[][] | null
  status: ShippingMethodStatus
  policy: ShippingMethodPolicy
  verifiedAt: any
  createdAt: any
  updatedAt: any
  orders: OrderEntity[]
  source: ShippingMethodEntity | null
}

export enum ShippingMethodStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived',
}

export enum ShippingMethodPolicy {
  private = 'private',
  public = 'public',
}
