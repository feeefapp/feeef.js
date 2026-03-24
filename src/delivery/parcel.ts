/**
 * Canonical parcel domain types — keep aligned with
 * `feeefapps/backend/services/delivery/domain/parcel.ts`.
 *
 * npm package name is `feeef`; this repo is the JS SDK source (`feeefjs`).
 */

import type { ShippingType as FeeefShippingType } from '../core/entities/order.js'

/** Same enum as platform `Order.shippingType` / npm `feeef` `ShippingType`. */
export type ParcelShippingType = FeeefShippingType

export interface ParcelLineItem {
  name: string
  quantity: number
  price?: number | null
  variantPath?: string | null
}

export interface ParcelContact {
  firstName?: string | null
  lastName?: string | null
  phones?: string[]
  emails?: string[]
}

export interface ParcelAddress {
  street: string | null
  cityCode: string | null
  stateCode: string | null
  country: string | null
  note?: string | null
}

export type ParcelDimensionUnit = 'cm' | 'm' | 'in'

export type ParcelWeightUnit = 'kg' | 'g' | 'lb' | 'oz'

export interface ParcelPackage {
  width?: number | null
  height?: number | null
  length?: number | null
  weight?: number | null
  fragile?: boolean | null
  dimensionUnit?: ParcelDimensionUnit | null
  weightUnit?: ParcelWeightUnit | null
}

/** Shipment category (forward / return / exchange) — field name on `ParcelCreate` is `type`. */
export type ParcelType = 'forward' | 'return' | 'exchange'

export interface ParcelUpdate {
  carrierId: string
  contact?: Partial<ParcelContact>
  address?: Partial<ParcelAddress>
  total?: number
  notes?: string | null
  summary?: string
  package?: Partial<ParcelPackage> | null
  items?: ParcelLineItem[]
  shippingType?: ParcelShippingType | string | null
  extensions?: Record<string, unknown>
}

export interface ParcelCreate {
  storeId: string
  reference: string
  contact: ParcelContact
  address: ParcelAddress
  /** Charged / COD amount (typically order total). Legacy JSON: `codAmount`. */
  total: number
  itemsPrice?: number | null
  declaredValue: number | null
  shippingType?: ParcelShippingType | string | null
  shippingPrice?: number | null
  freeShipping?: boolean | null
  /** Stop-desk / hub id (Yalidine `stopdesk_id`, ZR `hubId`). Legacy: `centerId`. */
  pickupId?: string | null
  fromStock?: boolean | null
  items: ParcelLineItem[]
  /** Legacy JSON: `productsSummary`. */
  summary: string
  notes: string | null
  metadata?: Record<string, unknown>
  extensions?: Record<string, unknown>
  package?: ParcelPackage | null
  /** Legacy JSON: `parcelType`. */
  type?: ParcelType | null
}
