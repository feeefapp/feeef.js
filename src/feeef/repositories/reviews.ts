import { type AxiosInstance } from 'axios'
import {
  type MerchantReviewEntity,
  type MerchantReviewListOptions,
  type MerchantReviewsPage,
  type OwnReviewEntity,
  type ProductReviewsListOptions,
  type ProductReviewsPage,
  type PublicReviewEntity,
  type ReviewAskFilter,
  type ReviewAsksPage,
  type ReviewBulkInput,
  type ReviewLinkEntity,
  type ReviewLinkSubmitInput,
  type ReviewModerationPatch,
  type ReviewReplyAiInput,
  type ReviewRequestEntity,
  type ReviewSummaryAiInput,
  type ReviewSummaryEntity,
  type ReviewTestimonialInput,
  type StorefrontReviewInput,
  type StorefrontReviewResult,
} from '../../core/entities/review.js'

/**
 * Product reviews (docs/product-reviews.md §6).
 *
 * Shopper calls (no login): `list`, `create`, `uploadPhoto`, and the review page
 * (`request`, `submit`) keyed by the token from the customer's link.
 * Merchant calls need a logged-in member with `reviews.read` / `reviews.write`
 * (or `orders.read` for asks and the review link).
 * AI calls are paid workflow steps: pass a key you persisted yourself.
 */
export class ReviewsRepository {
  constructor(private readonly client: AxiosInstance) {}

  // ─── Shoppers ──────────────────────────────────────────────────────────

  /** Published reviews of a product, plus the verified-only summary and effective settings. */
  async list(
    productId: string,
    options: ProductReviewsListOptions = {}
  ): Promise<ProductReviewsPage> {
    const res = await this.client.get(`/products/${encodeURIComponent(productId)}/reviews`, {
      params: options,
    })
    return res.data
  }

  /** Storefront form (only when the store or product allows it). Usually lands as `pending`. */
  async create(productId: string, input: StorefrontReviewInput): Promise<StorefrontReviewResult> {
    const res = await this.client.post(`/products/${encodeURIComponent(productId)}/reviews`, input)
    return res.data
  }

  /**
   * Upload one photo for the review page (`token`) or the storefront form (`productId`).
   * Pass a `FormData` with a `file` field. Returns the CDN URL to put in `photos`.
   */
  async uploadPhoto(form: FormData): Promise<{ url: string }> {
    const res = await this.client.post('/reviews/photos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  }

  /** Order context for the review page: products, the customer's own reviews, eligibility. */
  async request(token: string): Promise<ReviewRequestEntity> {
    const res = await this.client.get(`/reviews/requests/${encodeURIComponent(token)}`)
    return res.data
  }

  /** Create or edit the reviews of one order. Returns the refreshed request. */
  async submit(token: string, input: ReviewLinkSubmitInput): Promise<ReviewRequestEntity> {
    const res = await this.client.put(`/reviews/requests/${encodeURIComponent(token)}`, input)
    return res.data
  }

  // ─── Merchants ─────────────────────────────────────────────────────────

  async listForStore(
    storeId: string,
    options: MerchantReviewListOptions = {}
  ): Promise<MerchantReviewsPage> {
    const res = await this.client.get(`/stores/${encodeURIComponent(storeId)}/reviews`, {
      params: options,
    })
    return res.data
  }

  /** Merchant testimonial: published, labelled "Added by the store", never counted in stars. */
  async createTestimonial(
    storeId: string,
    input: ReviewTestimonialInput
  ): Promise<MerchantReviewEntity> {
    const res = await this.client.post(`/stores/${encodeURIComponent(storeId)}/reviews`, input)
    return res.data
  }

  async moderate(
    storeId: string,
    reviewId: string,
    patch: ReviewModerationPatch
  ): Promise<MerchantReviewEntity> {
    const res = await this.client.patch(
      `/stores/${encodeURIComponent(storeId)}/reviews/${encodeURIComponent(reviewId)}`,
      patch
    )
    return res.data
  }

  /** Publish, hide, reject or delete up to 100 reviews at once. */
  async bulk(storeId: string, input: ReviewBulkInput): Promise<{ updated: number }> {
    const res = await this.client.post(`/stores/${encodeURIComponent(storeId)}/reviews/bulk`, input)
    return res.data
  }

  async remove(storeId: string, reviewId: string): Promise<void> {
    await this.client.delete(
      `/stores/${encodeURIComponent(storeId)}/reviews/${encodeURIComponent(reviewId)}`
    )
  }

  /** Delivered orders by ask state: `todo`, `sent`, `reviewed` (or `all`). */
  async requests(
    storeId: string,
    options: { state?: ReviewAskFilter; page?: number; limit?: number } = {}
  ): Promise<ReviewAsksPage> {
    const res = await this.client.get(`/stores/${encodeURIComponent(storeId)}/reviews/requests`, {
      params: options,
    })
    return res.data
  }

  /** The review link for one order, plus whether it can be asked for now. */
  async reviewLink(storeId: string, orderId: string): Promise<ReviewLinkEntity> {
    const res = await this.client.get(
      `/stores/${encodeURIComponent(storeId)}/orders/${encodeURIComponent(orderId)}/review-link`
    )
    return res.data
  }

  /** Record that the store asked this customer (after sending the WhatsApp/SMS text). */
  async markRequestSent(
    storeId: string,
    orderId: string
  ): Promise<{ sentAt: string; sentCount: number }> {
    const res = await this.client.post(
      `/stores/${encodeURIComponent(storeId)}/orders/${encodeURIComponent(orderId)}/review-link/sent`
    )
    return res.data
  }

  /** Remove the saved AI summary of a product. */
  async deleteSummary(storeId: string, productId: string): Promise<void> {
    await this.client.delete(
      `/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}/review-summary`
    )
  }

  // ─── AI (paid workflow steps) ──────────────────────────────────────────

  /** Draft a public reply. The merchant reviews it before saving with `moderate`. */
  async draftReply(
    input: ReviewReplyAiInput,
    idempotencyKey: string
  ): Promise<{ success: boolean; reply: string }> {
    const res = await this.client.post('/ai/text/review-reply', input, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return res.data
  }

  /** Summarize a product's verified reviews (needs at least 3). Saved on the product. */
  async summarize(
    input: ReviewSummaryAiInput,
    idempotencyKey: string
  ): Promise<{ success: boolean; summary: ReviewSummaryEntity }> {
    const res = await this.client.post('/ai/text/review-summary', input, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return res.data
  }
}

export type { PublicReviewEntity, OwnReviewEntity }
