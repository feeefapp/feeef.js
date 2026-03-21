import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'

/**
 * Developer-registered app (OAuth client) returned by the apps API.
 * clientSecret is present only on create and regenerateSecret responses.
 */
export interface AppEntity {
  id: string
  /** Owner user id. Always present from API. */
  userId?: string
  name: string
  /** Optional app logo URL for OAuth consent and dashboard UI. */
  logoUrl?: string | null
  clientId: string
  redirectUris: string[]
  scopes: string[]
  active: boolean
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string | null
  /** Present only when returned from create or regenerateSecret. Store securely. */
  clientSecret?: string
}

/**
 * Input for creating a new app.
 * userId is optional; admins may set it to create an app for another user.
 */
export interface AppCreateInput {
  name: string
  /** Optional app logo URL. */
  logoUrl?: string
  redirectUris: string[]
  scopes: string[]
  userId?: string
}

/**
 * Input for updating an existing app.
 */
export interface AppUpdateInput {
  name?: string
  /** Optional app logo URL; pass null to clear. */
  logoUrl?: string | null
  redirectUris?: string[]
  scopes?: string[]
  active?: boolean
}

/**
 * Options for listing apps (pagination, filterator, search).
 * filterator: JSON string from dashboard advanced filter; backend applies filtering/ordering.
 * q: optional search (backend may support free-text search on name/clientId).
 */
export interface AppListOptions {
  page?: number
  limit?: number
  q?: string
  filterator?: string
  userId?: string
  active?: boolean
  params?: Record<string, any>
}

/**
 * Repository for developer-registered apps (CRUD and regenerate secret).
 * Requires an authenticated user (Bearer token).
 *
 * Terminology: "app" / "apps" is used consistently for the resource;
 * OAuth is used only for the flow (authorize, token endpoints).
 */
export class AppRepository extends ModelRepository<AppEntity, AppCreateInput, AppUpdateInput> {
  constructor(client: AxiosInstance) {
    super('apps', client)
  }

  /**
   * Lists apps with optional pagination and filterator.
   * @param options - Page, limit, filterator, q, and extra params forwarded to the API.
   */
  async list(options?: AppListOptions): Promise<ListResponse<AppEntity>> {
    const params: Record<string, any> = { ...options?.params }
    if (options) {
      if (options.page !== undefined) params.page = options.page
      if (options.limit !== undefined) params.limit = options.limit
      if (options.q !== undefined) params.q = options.q
      if (options.filterator !== undefined) params.filterator = options.filterator
      if (options.userId !== undefined) params.userId = options.userId
      if (options.active !== undefined) params.active = options.active
    }
    return super.list({ page: options?.page, limit: options?.limit, params })
  }

  /**
   * Regenerates the client secret for the app. Returns the app with
   * clientSecret set once; store it securely.
   *
   * @param id - The app id.
   * @returns The app including clientSecret.
   */
  async regenerateSecret(id: string): Promise<AppEntity> {
    const res = await this.client.post(`/${this.resource}/${id}/regenerate-secret`)
    return res.data
  }

  /**
   * Builds the OAuth authorize URL to which the user should be redirected.
   * This is the first step of the authorization-code flow (similar UX to Google OAuth).
   *
   * Production: opening this URL on the **API** host (`api.*`) issues a redirect to the same path on
   * **accounts.*** so the consent screen appears on the trusted accounts domain; query params are preserved.
   *
   * If the user is not logged in yet, API `GET /oauth/authorize` returns:
   * - `401 login_required`
   * - `login_url` (accounts sign-in URL with `next=...`)
   *
   * The client should navigate to `login_url`, let the user sign in, and then
   * continue by opening the original authorize URL again (or rely on `next`).
   *
   * @param params - Parameters for the authorize URL.
   * @param params.baseUrl - API base URL (e.g. https://api.feeef.org/api/v1).
   * @param params.clientId - The app client id.
   * @param params.redirectUri - Redirect URI registered for the app.
   * @param params.responseType - Must be 'code' for authorization code flow.
   * @param params.scope - Optional list of scopes (space-separated in URL).
   * @param params.state - Optional state for CSRF protection.
   * @param params.codeChallenge - Optional PKCE code challenge.
   * @param params.codeChallengeMethod - Optional 'S256' or 'plain'.
   * @returns The full authorize URL.
   */
  static buildAuthorizeUrl(params: {
    baseUrl: string
    clientId: string
    redirectUri: string
    responseType: string
    scope?: string[]
    state?: string
    codeChallenge?: string
    codeChallengeMethod?: string
  }): string {
    const base = params.baseUrl.endsWith('/') ? params.baseUrl : `${params.baseUrl}/`
    const url = new URL('oauth/authorize', base)
    url.searchParams.set('client_id', params.clientId)
    url.searchParams.set('redirect_uri', params.redirectUri)
    url.searchParams.set('response_type', params.responseType)
    if (params.scope?.length) url.searchParams.set('scope', params.scope.join(' '))
    if (params.state) url.searchParams.set('state', params.state)
    if (params.codeChallenge) url.searchParams.set('code_challenge', params.codeChallenge)
    if (params.codeChallengeMethod) {
      url.searchParams.set('code_challenge_method', params.codeChallengeMethod)
    }
    return url.toString()
  }
}
