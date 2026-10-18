/**
 * Product reviews (docs/product-reviews.md §6). Shapes mirror the backend exactly; the
 * backend is the authority for eligibility, stars and what a shopper may see.
 */

export type ReviewSource = 'order' | 'storefront' | 'merchant' | 'import'
export type ReviewStatus = 'pending' | 'published' | 'hidden' | 'rejected'
export type ReviewSort = 'relevant' | 'recent' | 'rating_desc' | 'rating_asc'
export type ReviewAskState = 'todo' | 'sent' | 'reviewed'
export type ReviewAskFilter = ReviewAskState | 'all'
export type ReviewTone = 'warm' | 'formal' | 'short'

export type ReviewHistogram = { '1': number; '2': number; '3': number; '4': number; '5': number }

/** Storefront-visible review. Never carries phone, IP, order id or moderation fields. */
export interface PublicReviewEntity {
  id: string
  productId: string
  rating: number
  title: string | null
  body: string | null
  photos: string[]
  /** Empty string when the customer chose to stay anonymous. */
  authorName: string
  source: ReviewSource
  /** True only for reviews written through a delivered order's signed link. */
  verified: boolean
  variantLabel: string | null
  reply: { body: string; at: string | null } | null
  createdAt: string
}

/** Effective settings for one product (store settings with the product override applied). */
export interface PublicReviewSettings {
  active: boolean
  storefrontForm: boolean
}

/** Stars come from verified reviews only; `total` counts every published review. */
export interface ReviewSummary {
  avg: number
  count: number
  histogram: ReviewHistogram
  total?: number
  withPhotos?: number
}

export interface ProductReviewsPage {
  data: PublicReviewEntity[]
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  summary: ReviewSummary
  settings: PublicReviewSettings
}

export interface ProductReviewsListOptions {
  page?: number
  limit?: number
  rating?: number
  withPhotos?: boolean
  verifiedOnly?: boolean
  sort?: ReviewSort
}

/** Storefront form (unverified). The backend answers 202 with the status it chose. */
export interface StorefrontReviewInput {
  rating: number
  name: string
  title?: string | null
  body?: string | null
  phone?: string | null
  photos?: string[] | null
  locale?: string | null
}

export interface StorefrontReviewResult {
  id: string
  status: ReviewStatus
}

/** One product line of the review page submission. */
export interface ReviewLinkItemInput {
  productId: string
  rating: number
  title?: string | null
  body?: string | null
  photos?: string[] | null
}

export interface ReviewLinkSubmitInput {
  items: ReviewLinkItemInput[]
  anonymous?: boolean
  authorName?: string | null
  locale?: string | null
}

export interface OwnReviewEntity extends PublicReviewEntity {
  status: ReviewStatus
  /** Still inside the 30-day edit window and the order is still reviewable. */
  editable: boolean
}

export interface ReviewRequestItem {
  productId: string
  name: string
  photoUrl: string | null
  variant: string | null
  /** Reviews are on for this product (store setting + product override). */
  active: boolean
  review: OwnReviewEntity | null
}

/** Order context for the review page (`GET /reviews/requests/:token`). */
export interface ReviewRequestEntity {
  active: boolean
  open: boolean
  reason: 'disabled' | 'not_delivered' | 'window_closed' | null
  deliveredAt: string | null
  closesAt: string | null
  customerFirstName: string | null
  authorPreview: string | null
  anonymous: boolean
  store: {
    name: string
    logoUrl: string | null
    url: string
    color: string | null
    phone: string | null
    whatsapp: string | null
  } | null
  items: ReviewRequestItem[]
}

/** Merchant view of a review: everything, including moderation state. */
export interface MerchantReviewEntity {
  id: string
  storeId: string
  productId: string
  orderId: string | null
  source: ReviewSource
  status: ReviewStatus
  verified: boolean
  rating: number
  title: string | null
  body: string | null
  photos: string[]
  authorName: string
  variantLabel: string | null
  locale: string | null
  replyBody: string | null
  replyAt: string | null
  moderatedBy: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string | null
  product: { id: string; name: string; photoUrl: string | null; slug: string } | null
}

export interface MerchantReviewListOptions {
  page?: number
  limit?: number
  status?: ReviewStatus
  source?: ReviewSource
  productId?: string
  rating?: number
  q?: string
}

export interface MerchantReviewsPage {
  data: MerchantReviewEntity[]
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  counts: Record<ReviewStatus, number>
  summary: ReviewSummary
}

export interface ReviewTestimonialInput {
  productId: string
  rating: number
  authorName: string
  title?: string | null
  body?: string | null
  photos?: string[] | null
}

export interface ReviewModerationPatch {
  status?: Exclude<ReviewStatus, 'pending'>
  /** `null` clears the public reply. */
  reply?: string | null
}

export interface ReviewBulkInput {
  ids: string[]
  status?: Exclude<ReviewStatus, 'pending'>
  delete?: boolean
}

/** A delivered order the store may ask for a review. */
export interface ReviewAskEntity {
  orderId: string
  customerName: string | null
  customerPhone: string | null
  deliveredAt: string
  items: { productId: string; name: string; photoUrl: string | null }[]
  state: ReviewAskState
  sentAt: string | null
  sentCount: number
}

export interface ReviewAsksPage {
  data: ReviewAskEntity[]
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  counts: Record<ReviewAskState, number>
}

export interface ReviewLinkEntity {
  eligible: boolean
  reason: 'disabled' | 'not_delivered' | 'window_closed' | null
  url: string
  deliveredAt: string | null
  closesAt: string | null
  productCount: number
  sentAt: string | null
  sentCount: number
}

export interface ReviewSummaryEntity {
  text: string
  pros: string[]
  cons: string[]
  basedOn: number
  locale: string
  generatedAt: string
}

export interface ReviewReplyAiInput {
  storeId: string
  reviewId: string
  tone?: ReviewTone
  instructions?: string | null
  locale?: string | null
}

export interface ReviewSummaryAiInput {
  storeId: string
  productId: string
  locale?: string | null
}

/** Store settings at `integrations.reviews` (free; on by default). */
export interface ReviewsIntegration {
  active?: boolean
  autoPublishVerified?: boolean
  storefrontForm?: boolean
  autoPublishStorefront?: boolean
  showReplies?: boolean
  /** Store-only: push the team on new customer reviews. */
  notifyNewReviews?: boolean
  /** Store-only: WhatsApp text for "Ask for a review" (max 500 chars). */
  requestMessage?: string | null
}

/** Per-product override at `integrationsData.reviewsData`. Unset keys inherit the store. */
export interface ProductReviewsData {
  useProductSettings?: boolean
  active?: boolean | null
  autoPublishVerified?: boolean | null
  storefrontForm?: boolean | null
  autoPublishStorefront?: boolean | null
  showReplies?: boolean | null
}
