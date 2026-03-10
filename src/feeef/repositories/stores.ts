import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  StoreEntity,
  StoreSummary,
  StoreMember,
  StoreInvite,
  CreateStoreInviteInput,
  StoreSubscriptionType,
  AddStoreMemberInput,
  UpdateStoreMemberInput,
  StoreCreateInput,
  StoreUpdateInput,
} from '../../core/entities/store.js'

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
        ...(userId && { user_id: userId }),
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
   * Creates a store invite (sends email to invitee).
   * @param storeId - The store ID.
   * @param data - The invite data.
   * @returns A Promise that resolves to the created invite.
   */
  async createInvite(storeId: string, data: CreateStoreInviteInput): Promise<StoreInvite> {
    const res = await this.client.post(`/${this.resource}/${storeId}/invites`, data)
    return res.data
  }

  /**
   * Lists invites for a store.
   * @param storeId - The store ID.
   * @param params - Optional filters (e.g. status).
   * @returns A Promise that resolves to the list of invites.
   */
  async listInvites(storeId: string, params?: { status?: string }): Promise<StoreInvite[]> {
    const res = await this.client.get(`/${this.resource}/${storeId}/invites`, { params })
    return res.data
  }

  /**
   * Revokes a pending invite.
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   */
  async revokeInvite(storeId: string, inviteId: string): Promise<void> {
    await this.client.delete(`/${this.resource}/${storeId}/invites/${inviteId}`)
  }

  /**
   * Gets invite details (public or full if authorized).
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   * @returns A Promise that resolves to the invite.
   */
  async getInvite(storeId: string, inviteId: string): Promise<StoreInvite> {
    const res = await this.client.get(`/${this.resource}/${storeId}/invites/${inviteId}`)
    return res.data
  }

  /**
   * Accepts an invite (authenticated user's email must match invite email).
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   * @param token - The invite token from the email link.
   * @returns A Promise that resolves to the created store member.
   */
  async acceptInvite(storeId: string, inviteId: string, token: string): Promise<StoreMember> {
    const res = await this.client.post(`/${this.resource}/${storeId}/invites/${inviteId}/accept`, {
      token,
    })
    return res.data
  }

  /**
   * Upgrades or renews a store's subscription plan.
   * @param id - The store ID.
   * @param plan - The plan type to upgrade to.
   * @param months - The number of months (1-12).
   * @returns A Promise that resolves when the upgrade is complete.
   */
  async upgrade(id: string, plan: StoreSubscriptionType, months: number): Promise<void> {
    await this.client.post(`/${this.resource}/${id}/subscription/upgrade`, {
      plan,
      months,
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
  async payDue(storeId: string, amount: number): Promise<PayDueResult> {
    const res = await this.client.post(`/${this.resource}/${storeId}/subscription/payDue`, {
      amount,
    })
    return res.data
  }
}
