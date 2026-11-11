import { type AxiosInstance } from 'axios'

/** `GET /wallet/cloud` */
export interface CloudWalletStatus {
  walletId: string
  /** Spendable DZD. */
  balance: number
  /** DZD held by in-flight charges. */
  reserved?: number
  /** DZD awaiting review (manual top-ups with proof). */
  incoming?: number
  currency?: string
}

export interface CloudTopUpInput {
  /** DZD, 100 … 10 000 000. */
  amount: number
  /** Client-generated per tap (`[A-Za-z0-9_-]{8,64}`): a retry returns the same deposit. */
  requestKey: string
  /** Origin of the page embedding the checkout, e.g. `https://app.feeef.org`. */
  origin: string
  returnUrl?: string
  locale?: 'ar' | 'fr' | 'en'
}

/** `POST /wallet/cloud/top-ups` — open `checkout.url` (or mount `clientSecret`). */
export interface CloudTopUpResult {
  deposit: {
    id: string
    state: string
    amount: number
    paymentReference: string | null
    expiresAt: string | null
  }
  checkout: { id: string; clientSecret: string; url: string }
}

export type CloudDepositReviewBasis =
  'bank_statement' | 'ccp_statement' | 'provider_portal' | 'cash_receipt' | 'other'

/**
 * Feeef Cloud wallet: balance + top-ups for the signed-in user, and the manager review
 * queue for manual top-ups (`manageCloudWallets`). Every gateway (Stripe, SATIM, SlickPay,
 * Chargily) and manual method (CCP, BaridiMob, RedotPay, Binance, USDT …) runs on the
 * Cloud hosted checkout.
 */
export class CloudWalletRepository {
  constructor(private readonly client: AxiosInstance) {}

  /** Live balance (the Cloud wallet is created on first call). */
  async get(): Promise<CloudWalletStatus> {
    const res = await this.client.get('/wallet/cloud')
    return res.data
  }

  /** Starts a top-up and returns the hosted checkout to open. */
  async topUp(input: CloudTopUpInput): Promise<CloudTopUpResult> {
    const res = await this.client.post('/wallet/cloud/top-ups', input)
    return res.data
  }

  /** Managers: Cloud deposits by state (default `awaiting_review`). */
  async listDeposits(options?: { state?: string; cursor?: string }): Promise<{
    data: Record<string, any>[]
    next_cursor?: string | null
  }> {
    const res = await this.client.get('/admins/cloud-wallet/deposits', { params: options })
    return res.data
  }

  /** Managers: one deposit with its proof file list. */
  async getDeposit(id: string): Promise<Record<string, any>> {
    const res = await this.client.get(`/admins/cloud-wallet/deposits/${id}`)
    return res.data
  }

  /** Managers: proof file bytes (never cached). */
  async evidence(depositId: string, evidenceId: string): Promise<Blob> {
    const res = await this.client.get(
      `/admins/cloud-wallet/deposits/${depositId}/evidence/${evidenceId}`,
      { responseType: 'blob' }
    )
    return res.data
  }

  /** Managers: approve a manual top-up — Cloud credits the wallet exactly once. */
  async approveDeposit(
    id: string,
    input: { basis: CloudDepositReviewBasis; note?: string }
  ): Promise<Record<string, any>> {
    const res = await this.client.post(`/admins/cloud-wallet/deposits/${id}/approve`, input)
    return res.data
  }

  /** Managers: reject a manual top-up with a reason the merchant sees. */
  async rejectDeposit(id: string, reason: string): Promise<Record<string, any>> {
    const res = await this.client.post(`/admins/cloud-wallet/deposits/${id}/reject`, { reason })
    return res.data
  }

  /** Managers: move one user's wallet to Cloud now. */
  async migrateUser(userId: string): Promise<Record<string, any>> {
    const res = await this.client.post(`/admins/cloud-wallet/users/${userId}/migrate`)
    return res.data
  }
}
