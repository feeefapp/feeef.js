import { AxiosInstance } from 'axios'

/**
 * OAuth token response from `POST /oauth/token`.
 */
export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

/**
 * OAuth revoke response from `POST /oauth/revoke`.
 */
export interface OAuthRevokeResponse {
  revoked: boolean
}

/**
 * OAuth introspection response from `POST /oauth/introspect`.
 */
export interface OAuthIntrospectResponse {
  active: boolean
  scope?: string
  client_id?: string | null
  username?: string | null
  token_type?: string
  exp?: number | null
}

/**
 * Parameters for building the browser authorization URL.
 */
export interface OAuthAuthorizeUrlParams {
  baseUrl: string
  clientId: string
  redirectUri: string
  scope?: string[]
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: 'S256' | 'plain' | string
}

/**
 * Parameters for exchanging authorization code to access token.
 */
export interface OAuthExchangeCodeParams {
  code: string
  redirectUri: string
  clientId: string
  clientSecret: string
  codeVerifier?: string
}

/**
 * Repository for Feeef OAuth2 developer endpoints.
 * This exposes typed wrappers for:
 * - `/oauth/authorize` (URL helper)
 * - `/oauth/token`
 * - `/oauth/revoke`
 * - `/oauth/introspect`
 */
export class OAuthRepository {
  client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Builds the authorize URL for browser redirect.
   */
  static buildAuthorizeUrl(params: OAuthAuthorizeUrlParams): string {
    const base = params.baseUrl.endsWith('/') ? params.baseUrl : `${params.baseUrl}/`
    const url = new URL('oauth/authorize', base)
    url.searchParams.set('client_id', params.clientId)
    url.searchParams.set('redirect_uri', params.redirectUri)
    url.searchParams.set('response_type', 'code')
    if (params.scope?.length) url.searchParams.set('scope', params.scope.join(' '))
    if (params.state) url.searchParams.set('state', params.state)
    if (params.codeChallenge) url.searchParams.set('code_challenge', params.codeChallenge)
    if (params.codeChallengeMethod) {
      url.searchParams.set('code_challenge_method', params.codeChallengeMethod)
    }
    return url.toString()
  }

  /**
   * Exchanges an authorization code for an access token.
   */
  async exchangeAuthorizationCode(params: OAuthExchangeCodeParams): Promise<OAuthTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    })
    if (params.codeVerifier) {
      body.set('code_verifier', params.codeVerifier)
    }

    const response = await this.client.post('/oauth/token', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data as OAuthTokenResponse
  }

  /**
   * Revokes an OAuth token.
   */
  async revokeToken(token: string, tokenTypeHint?: string): Promise<OAuthRevokeResponse> {
    const body = new URLSearchParams({ token })
    if (tokenTypeHint) {
      body.set('token_type_hint', tokenTypeHint)
    }
    const response = await this.client.post('/oauth/revoke', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data as OAuthRevokeResponse
  }

  /**
   * Introspects an OAuth token.
   */
  async introspectToken(token: string): Promise<OAuthIntrospectResponse> {
    const body = new URLSearchParams({ token })
    const response = await this.client.post('/oauth/introspect', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data as OAuthIntrospectResponse
  }
}
