import { AxiosInstance } from 'axios'

/**
 * Promo entity (list item from GET /promos).
 */
export interface PromoEntity {
  id: string
  code: string
  discount: Array<[number, number]>
  strict: boolean
  min_months: number | null
  count: number
  max: number | null
  starts_at: string | null
  ends_at: string | null
  referral_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Result of POST /promos/validate.
 */
export interface PromoValidationResult {
  valid: boolean
  reason?: 'invalid' | 'expired' | 'not_yet_valid' | 'max_uses'
  code?: string
  discount?: Array<[number, number]>
  strict?: boolean
  minMonths?: number
}

/**
 * List response for promos (backend returns { data, total, page, limit }).
 */
export interface PromoListResponse {
  data: PromoEntity[]
  total?: number
  page?: number
  limit?: number
}

/**
 * Input for creating a promo.
 */
export interface PromoCreateInput {
  code: string
  discount: Array<[number, number]>
  strict: boolean
  min_months?: number | null
  max?: number | null
  starts_at?: string | null
  ends_at?: string | null
  referral_id?: string | null
}

/**
 * Repository for promo codes: list, validate, create.
 */
export class PromoRepository {
  constructor(private client: AxiosInstance) {}

  /**
   * Lists promos with optional pagination and validNow filter.
   */
  async list(params?: {
    page?: number
    limit?: number
    validNow?: boolean
    filterator?: string
  }): Promise<PromoListResponse> {
    const query: Record<string, unknown> = {}
    // eslint-disable-next-line eqeqeq
    if (params?.page != null) query.page = params.page
    // eslint-disable-next-line eqeqeq
    if (params?.limit != null) query.limit = params.limit
    if (params?.validNow === true) query.validNow = '1'
    if (params?.filterator) query.filterator = params.filterator
    const res = await this.client.get('/promos', { params: query })
    return res.data as PromoListResponse
  }

  /**
   * Fetches a single promo by id.
   */
  async find(params: { id: string }): Promise<PromoEntity> {
    const res = await this.client.get(`/promos/${params.id}`)
    return res.data as PromoEntity
  }

  /**
   * Validates a promo code. Returns validation result with discount info or reason.
   */
  async validate(params: { code: string; storeId?: string }): Promise<PromoValidationResult> {
    const res = await this.client.post('/promos/validate', {
      code: params.code,
      storeId: params.storeId,
    })
    return res.data as PromoValidationResult
  }

  /**
   * Creates a promo (admin). Returns the created promo.
   */
  async create(data: PromoCreateInput): Promise<PromoEntity> {
    const res = await this.client.post('/promos', data)
    return res.data as PromoEntity
  }
}
