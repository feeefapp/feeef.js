import { AxiosInstance } from 'axios'

/**
 * Opencod Orders v1 catalog + lifecycle surface.
 * Mirrors Feeef Dart `OrdersV1Api` / Opencod `statusId`/`room`/`kind`/`closeAs`.
 */
export interface OrderStatusV1Entity {
  id: string
  slug: string
  room: string
  name: string
  kind?: string | null
  locales?: Record<string, string>
  color?: string | null
  icon?: string | null
  sortOrder?: number
  system?: boolean
  isActive?: boolean
  closeAs?: string
  deskOutcome?: string
  snoozeMinutes?: number | null
  requiresReason?: boolean
  queueEligible?: boolean
  reasons?: string[] | null
  nextSlugs?: string[] | null
  onSelect?: Record<string, unknown> | null
}

export interface OrderCountsV1 {
  all: number
  byRoom: Record<string, number>
  byStatus: Record<string, number>
  /** Present when `?room=` scoped the request. */
  room?: string
}

export interface OrderV1ApplyResult {
  id: string
  room: string | null
  kind: string | null
  statusId: string | null
  status?: OrderStatusV1Entity | null
  cash?: string
  stock?: string
  closeAs?: string
  deprecated?: {
    status?: string
    deliveryStatus?: string | null
    customStatus?: string | null
  }
}

/**
 * Repository for `/stores/:storeId/statuses` and order apply / doors / counts.
 */
export class OrdersV1Repository {
  constructor(private client: AxiosInstance) {}

  async listStatuses(
    storeId: string,
    options: { room?: string; includeInactive?: boolean } = {}
  ): Promise<OrderStatusV1Entity[]> {
    const res = await this.client.get(`/stores/${storeId}/statuses`, {
      params: {
        ...(options.room ? { room: options.room } : {}),
        ...(options.includeInactive ? { includeInactive: 1 } : {}),
      },
    })
    return (res.data?.data ?? res.data ?? []) as OrderStatusV1Entity[]
  }

  async counts(storeId: string, options: { room?: string } = {}): Promise<OrderCountsV1> {
    const res = await this.client.get(`/stores/${storeId}/orders/counts`, {
      params: options.room ? { room: options.room } : undefined,
    })
    return res.data as OrderCountsV1
  }

  async apply(
    storeId: string,
    orderId: string,
    body: { statusId?: string; kind?: string; slug?: string; allowCrossRoom?: boolean }
  ): Promise<OrderV1ApplyResult> {
    const res = await this.client.post(`/stores/${storeId}/orders/${orderId}/apply`, body)
    return (res.data?.data ?? res.data) as OrderV1ApplyResult
  }

  /** Open → pack door (Opencod SPEC-API-010). */
  async confirm(
    storeId: string,
    orderId: string,
    body: { type?: 'home' | 'pickup' | 'store'; stockout?: boolean; reason?: string } = {}
  ): Promise<OrderV1ApplyResult> {
    const res = await this.client.post(`/stores/${storeId}/orders/${orderId}/confirm`, body)
    return (res.data?.data ?? res.data) as OrderV1ApplyResult
  }

  /** Open → fail door (Opencod SPEC-API-011). */
  async reject(
    storeId: string,
    orderId: string,
    body: { kind?: 'cancel' | 'fake' | 'clone'; reason?: string } = {}
  ): Promise<OrderV1ApplyResult> {
    const res = await this.client.post(`/stores/${storeId}/orders/${orderId}/reject`, {
      kind: body.kind ?? 'cancel',
      ...(body.reason ? { reason: body.reason } : {}),
    })
    return (res.data?.data ?? res.data) as OrderV1ApplyResult
  }
}
