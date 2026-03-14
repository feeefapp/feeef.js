import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'

/**
 * Developer-registered app (OAuth client) returned by the apps API.
 * clientSecret is present only on create and regenerateSecret responses.
 */
export interface AppEntity {
  id: string
  /** Owner user id. Always present from API. */
  userId?: string
  name: string
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
 */
export interface AppCreateInput {
  name: string
  redirectUris: string[]
  scopes: string[]
}

/**
 * Input for updating an existing app.
 */
export interface AppUpdateInput {
  name?: string
  redirectUris?: string[]
  scopes?: string[]
  active?: boolean
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
