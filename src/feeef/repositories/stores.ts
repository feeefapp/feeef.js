import { type AxiosInstance } from 'axios'
import { ModelRepository, type ListResponse } from './repository.js'
import {
  type StoreEntity,
  type StoreSummary,
  type StoreMember,
  type StoreSubscriptionType,
  type AddStoreMemberInput,
  type UpdateStoreMemberInput,
  type StoreCreateInput,
  type StoreUpdateInput,
} from '../../core/entities/store.js'
import type { LiteOrdersReport } from '../../core/entities/order.js'
import { StoreInvitesRepository } from './store_invites_repository.js'

/**
 * Options for listing stores
 */
export interface StoreListOptions {
  page?: number
  offset?: number
  limit?: number
  userId?: string
  params?: Record<string, any>
}

/**
 * Options for getting store summary
 */
export interface StoreSummaryOptions {
  id: string
  from?: Date | string
  to?: Date | string
}

/**
 * Result from paying store due
 */
export interface PayDueResult {
  success: boolean
  paidAmount: number
  remainingDue: number
  cost: number
}

export interface PayDueOptions {
  /** `checkout` (Cloud billing only): pay on the Feeef Cloud hosted checkout. */
  payWith?: 'wallet' | 'checkout'
  /** Hosted checkout: where to send the payer back. */
  returnUrl?: string
  /** Stable per pay intent so a retried request never charges twice. */
  idempotencyKey?: string
}

/** `payDue` with `payWith: 'checkout'`: open `checkoutUrl`, then poll `dueInvoice`. */
export interface PayDueCheckoutStart {
  success: true
  payWith: 'cloud'
  invoiceId: string
  checkoutUrl: string | null
  amount: number
}

export interface DueInvoiceStatus {
  invoiceId: string
  status: 'open' | 'payment_pending' | 'paid' | 'void' | 'uncollectible'
  paid: boolean
  points: number
  amount: number
  remainingDue: number
}

export interface PlanCheckoutInput {
  plan: string
  months: number
  code?: string | null
  /** `wallet` debits now; `checkout` (default) opens the Cloud hosted checkout. */
  payWith?: 'wallet' | 'checkout'
  /** Method the hosted checkout opens on first (every published method stays available). */
  paymentMethod?: string | null
  returnUrl?: string | null
  /** Stable per pay intent so a retried request never opens a second subscription. */
  idempotencyKey?: string
}

/** `POST /stores/:id/subscription/checkout`. `payWith: 'cloud'` → open `checkoutUrl`, poll `planInvoice`. */
export type PlanCheckoutResult =
  | { success: true; payWith: 'wallet'; subscription: any; quote: Record<string, any> }
  | {
      success: true
      payWith: 'cloud'
      checkoutUrl: string | null
      invoiceId: string
      cloudSubscriptionId: string
      amount: number
      quote: Record<string, any>
    }

export interface PlanInvoiceStatus {
  invoiceId: string
  status: 'open' | 'payment_pending' | 'paid' | 'void' | 'uncollectible'
  paid: boolean
  amount: number
  /** The store's subscription once the plan is applied. */
  subscription: any
}

/**
 * Repository for managing Store entities.
 */
export class StoreRepository extends ModelRepository<
  StoreEntity,
  StoreCreateInput,
  StoreUpdateInput
> {
  /**
   * Constructs a new StoreRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('stores', client)
  }

  /**
   * Lists stores with optional filtering.
   * @param options - The options for listing stores.
   * @returns A Promise that resolves to a list of Store entities.
   */
  async list(options?: StoreListOptions): Promise<ListResponse<StoreEntity>> {
    const { userId, ...listOptions } = options || {}
    return super.list({
      ...listOptions,
      params: {
        ...listOptions.params,
        // StoreFilter.user() — owned by or member of this user
        ...(userId && { user: userId, user_id: userId }),
      },
    })
  }

  /**
   * Gets the summary for a store.
   * @param options - The summary options including store ID and date range.
   * @returns A Promise that resolves to the store summary.
   */
  async summary(options: StoreSummaryOptions): Promise<StoreSummary> {
    const { id, from, to } = options
    const params: Record<string, string> = {}
    if (from) params.from = from instanceof Date ? from.toISOString() : from
    if (to) params.to = to instanceof Date ? to.toISOString() : to

    const res = await this.client.get(`/${this.resource}/${id}/summary`, { params })
    return res.data
  }

  /**
   * Gets the orders chart data for a store.
   * @param id - The store ID.
   * @returns A Promise that resolves to a map of date to order count.
   */
  async chart(id: string): Promise<Map<Date, number>> {
    const res = await this.client.get(`/${this.resource}/${id}/chart`)
    const chartData = new Map<Date, number>()

    if (res.data.orders) {
      for (const [key, value] of Object.entries(res.data.orders)) {
        chartData.set(new Date(key), Number(value))
      }
    }

    return chartData
  }

  /**
   * Lite orders report for the store (8 UTC days + total).
   */
  async liteOrdersReport(storeId: string): Promise<{ lor: LiteOrdersReport }> {
    const res = await this.client.get(`/${this.resource}/${storeId}/analytics/lor`)
    return res.data
  }

  /**
   * Adds a member to the store.
   * @param storeId - The store ID.
   * @param data - The member data.
   * @returns A Promise that resolves to the added member.
   */
  async addMember(storeId: string, data: AddStoreMemberInput): Promise<StoreMember> {
    const res = await this.client.post(`/${this.resource}/${storeId}/members`, {
      email: data.email,
      role: data.role,
      name: data.name,
      metadata: data.metadata,
    })
    return res.data
  }

  /**
   * Edits a store member.
   * @param storeId - The store ID.
   * @param memberId - The member ID.
   * @param data - The update data.
   * @returns A Promise that resolves to the updated member.
   */
  async editMember(
    storeId: string,
    memberId: string,
    data: UpdateStoreMemberInput
  ): Promise<StoreMember> {
    const res = await this.client.put(`/${this.resource}/${storeId}/members/${memberId}`, {
      role: data.role,
      name: data.name,
      metadata: data.metadata,
    })
    return res.data
  }

  /**
   * Removes a member from the store.
   * @param storeId - The store ID.
   * @param memberId - The member ID.
   * @returns A Promise that resolves when the member is removed.
   */
  async removeMember(storeId: string, memberId: string): Promise<void> {
    await this.client.delete(`/${this.resource}/${storeId}/members/${memberId}`)
  }

  /**
   * Repository for store invites. Use e.g. `ff.stores.invites.list(storeId)`, `ff.stores.invites.create(storeId, data)`.
   */
  get invites(): StoreInvitesRepository {
    return new StoreInvitesRepository(this.client, this.resource)
  }

  /**
   * Upgrades or renews a store's subscription plan.
   * @param id - The store ID.
   * @param plan - The plan type to upgrade to.
   * @param months - The number of months (1-12).
   * @param code - Optional promo code.
   */
  async upgrade(
    id: string,
    plan: StoreSubscriptionType,
    months: number,
    options?: { code?: string }
  ): Promise<void> {
    await this.client.post(`/${this.resource}/${id}/subscription/upgrade`, {
      plan,
      months,

      ...(options?.code != null && options.code !== '' && { code: options.code }),
    })
  }

  /**
   * Purchases additional points for a store's subscription.
   * @param id - The store ID.
   * @param points - The number of points to purchase.
   * @returns A Promise that resolves when the charge is complete.
   */
  async charge(id: string, points: number): Promise<void> {
    await this.client.post(`/${this.resource}/${id}/subscription/charge`, {
      points,
    })
  }

  /**
   * Pays store due amount.
   * @param storeId - The store ID.
   * @param amount - The amount of due to pay (in points).
   * @returns A Promise that resolves to the payment result.
   */
  async payDue(
    storeId: string,
    amount: number,
    options?: PayDueOptions
  ): Promise<PayDueResult | PayDueCheckoutStart> {
    const res = await this.client.post(
      `/${this.resource}/${storeId}/subscription/payDue`,
      {
        amount,
        ...(options?.payWith ? { payWith: options.payWith } : {}),
        ...(options?.returnUrl ? { returnUrl: options.returnUrl } : {}),
      },
      options?.idempotencyKey
        ? { headers: { 'Idempotency-Key': options.idempotencyKey } }
        : undefined
    )
    return res.data
  }

  /**
   * Status of a store-due Cloud invoice opened by `payDue` with `payWith: 'checkout'`.
   * Poll it while the payer is on the hosted checkout.
   */
  async dueInvoice(storeId: string, invoiceId: string): Promise<DueInvoiceStatus> {
    const res = await this.client.get(
      `/${this.resource}/${storeId}/subscription/due-invoices/${invoiceId}`
    )
    return res.data
  }

  /** Buys / renews a plan through Feeef Cloud billing (wallet or hosted checkout). */
  async planCheckout(storeId: string, input: PlanCheckoutInput): Promise<PlanCheckoutResult> {
    const { idempotencyKey, ...body } = input
    const res = await this.client.post(
      `/${this.resource}/${storeId}/subscription/checkout`,
      body,
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
    )
    return res.data
  }

  /** Status of a plan invoice opened by `planCheckout`; poll while the payer is on the checkout. */
  async planInvoice(storeId: string, invoiceId: string): Promise<PlanInvoiceStatus> {
    const res = await this.client.get(
      `/${this.resource}/${storeId}/subscription/invoices/${invoiceId}`
    )
    return res.data
  }
}
