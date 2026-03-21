/**
 * CRUD envelope broadcast on Feeef Transmit channels (e.g. `stores/:storeId/orders`).
 *
 * Aligns with the Dart `RealtimeCrudEvent` and backend `sendRealtimeCrudEvent`.
 */
export interface RealtimeCrudEvent<T = unknown> {
  event: 'created' | 'updated' | 'deleted'
  data: T
}
