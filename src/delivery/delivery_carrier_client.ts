/**
 * Logical client surface for carrier integrations — mirrors backend `DeliveryService`
 * (`feeefapps/backend/services/delivery/delivery_service.ts`).
 */

import type { ParcelCreate, ParcelUpdate } from './parcel.js'

export interface DeliveryCarrierClient {
  readonly providerId: string

  send(parcel: ParcelCreate): Promise<Record<string, unknown>>
  sendMany(parcels: ParcelCreate[]): Promise<Record<string, unknown>>

  unsend(trackingOrCarrierId: string): Promise<unknown>
  unsendMany(ids: string[]): Promise<unknown>

  update(input: ParcelUpdate): Promise<unknown>
  updateMany(updates: ParcelUpdate[]): Promise<unknown>

  delete(id: string): Promise<unknown>
  deleteMany(ids: string[]): Promise<unknown>

  label(tracking: string, options?: Record<string, unknown>): Promise<unknown>
  labels(ids: string[], options?: Record<string, unknown>): Promise<unknown>

  show(id: string): Promise<unknown>
  list(query?: Record<string, unknown>): Promise<unknown>
}
