import { AxiosInstance } from 'axios'
import {
  StoreInvite,
  CreateStoreInviteInput,
  StoreMember,
} from '../../core/entities/store.js'

/**
 * Repository for store invites. Exposed as `ff.stores.invites`.
 * All methods require a store ID since invites are scoped to a store.
 */
export class StoreInvitesRepository {
  constructor(
    private readonly client: AxiosInstance,
    private readonly resource: string
  ) {}

  /**
   * Lists invites for a store.
   * @param storeId - The store ID.
   * @param params - Optional filters (e.g. status).
   * @returns A Promise that resolves to the list of invites.
   */
  async list(
    storeId: string,
    params?: { status?: string }
  ): Promise<StoreInvite[]> {
    const res = await this.client.get(
      `/${this.resource}/${storeId}/invites`,
      { params }
    )
    return res.data
  }

  /**
   * Creates a store invite (sends email to invitee).
   * @param storeId - The store ID.
   * @param data - The invite data.
   * @returns A Promise that resolves to the created invite.
   */
  async create(
    storeId: string,
    data: CreateStoreInviteInput
  ): Promise<StoreInvite> {
    const res = await this.client.post(
      `/${this.resource}/${storeId}/invites`,
      data
    )
    return res.data
  }

  /**
   * Gets invite details (public or full if authorized).
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   * @returns A Promise that resolves to the invite.
   */
  async get(storeId: string, inviteId: string): Promise<StoreInvite> {
    const res = await this.client.get(
      `/${this.resource}/${storeId}/invites/${inviteId}`
    )
    return res.data
  }

  /**
   * Revokes a pending invite.
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   */
  async revoke(storeId: string, inviteId: string): Promise<void> {
    await this.client.delete(
      `/${this.resource}/${storeId}/invites/${inviteId}`
    )
  }

  /**
   * Accepts an invite (authenticated user's email must match invite email).
   * @param storeId - The store ID.
   * @param inviteId - The invite ID.
   * @param token - The invite token from the email link.
   * @returns A Promise that resolves to the created store member.
   */
  async accept(
    storeId: string,
    inviteId: string,
    token: string
  ): Promise<StoreMember> {
    const res = await this.client.post(
      `/${this.resource}/${storeId}/invites/${inviteId}/accept`,
      { token }
    )
    return res.data
  }
}
