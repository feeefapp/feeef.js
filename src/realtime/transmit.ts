/**
 * Feeef + AdonisJS Transmit (SSE) integration for browser clients.
 *
 * Uses the official {@link https://www.npmjs.com/package/@adonisjs/transmit-client @adonisjs/transmit-client}.
 * The event stream and subscribe/unsubscribe endpoints live on the **API origin**, not under `/v1`
 * (e.g. `https://api.feeef.org/__transmit/events`, same as the Flutter `transmit_client`).
 */
import { Transmit } from '@adonisjs/transmit-client'
import type { AxiosInstance } from 'axios'

export { Subscription, Transmit } from '@adonisjs/transmit-client'

/** Transmit status string literals (mirrors @adonisjs/transmit-client `TransmitStatus`). */
export type FeeefTransmitConnectionStatus =
  | 'initializing'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'

/**
 * Strips REST prefixes from the axios/API base URL so Transmit hits the same host as the Dart SDK.
 *
 * @example
 * `https://api.feeef.org/v1` → `https://api.feeef.org`
 * `http://localhost:3333/api/v1` → `http://localhost:3333`
 */
export function transmitRootFromApiBaseUrl(apiBaseUrl: string): string {
  let u = apiBaseUrl.trim().replace(/\/+$/, '')
  if (u.endsWith('/api/v1')) {
    u = u.slice(0, -'/api/v1'.length)
  } else if (u.endsWith('/v1')) {
    u = u.slice(0, -'/v1'.length)
  }
  return u
}

function retrieveXsrfTokenFromCookie(): string | null {
  const cookie = (globalThis as { document?: { cookie?: string } }).document?.cookie
  if (!cookie) return null
  const match = cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'))
  return match ? decodeURIComponent(match[3]) : null
}

/**
 * HTTP client shape used by Transmit subscriptions: adds Bearer auth on subscribe/unsubscribe.
 *
 * The stock Adonis `beforeSubscribe` hook receives a frozen {@link Request}; mutating
 * `request.headers` is not reliable. Putting `Authorization` on the request at creation time fixes SPA token auth.
 */
export class FeeefTransmitHttpClient {
  constructor(
    private readonly options: { baseUrl: string; uid: string },
    private readonly getAuthorizationHeader: () => string | undefined
  ) {}

  send(request: Request): Promise<Response> {
    return fetch(request)
  }

  createRequest(path: string, body: Record<string, unknown>): Request {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': retrieveXsrfTokenFromCookie() ?? '',
    }
    const auth = this.getAuthorizationHeader()
    if (auth) {
      headers.Authorization = auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`
    }
    return new Request(`${this.options.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uid: this.options.uid, ...body }),
      credentials: 'include',
    })
  }
}

export type CreateFeeefTransmitOptions = {
  /**
   * REST API base URL (e.g. axios `defaults.baseURL`), with or without `/v1` or `/api/v1`.
   */
  apiBaseUrl: string
  /**
   * Return the current access token (without `Bearer `). If omitted, only cookie/XSRF auth is used.
   */
  getAccessToken?: () => string | null | undefined
  /**
   * Extra options forwarded to `Transmit` (must not override `baseUrl` or `httpClientFactory`).
   */
  transmit?: Omit<
    Partial<ConstructorParameters<typeof Transmit>[0]>,
    'baseUrl' | 'httpClientFactory'
  >
}

/**
 * Construct a {@link Transmit} client for Feeef: correct root URL + Bearer subscribe/unsubscribe.
 */
export function createFeeefTransmit(options: CreateFeeefTransmitOptions): Transmit {
  const baseUrl = transmitRootFromApiBaseUrl(options.apiBaseUrl)
  const getToken = options.getAccessToken ?? (() => undefined)

  return new Transmit({
    ...options.transmit,
    baseUrl,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Transmit’s HttpClient is not exported; FeeefTransmitHttpClient matches its shape.
    httpClientFactory: (url, uid): any =>
      new FeeefTransmitHttpClient({ baseUrl: url, uid }, () => {
        const t = getToken()
        if (t === null || t === undefined || t === '') return undefined
        const s = String(t).trim()
        return s.startsWith('Bearer ') ? s : `Bearer ${s}`
      }),
  })
}

/**
 * Same as {@link createFeeefTransmit} but reads the API base URL and token from an Axios instance
 * (e.g. Feeef `client.defaults`).
 */
export function createFeeefTransmitFromAxios(
  client: AxiosInstance,
  options?: Omit<CreateFeeefTransmitOptions, 'apiBaseUrl' | 'getAccessToken'>
): Transmit {
  const apiBaseUrl = client.defaults.baseURL ?? ''
  return createFeeefTransmit({
    ...options,
    apiBaseUrl,
    getAccessToken: () => {
      const raw = client.defaults.headers.common?.Authorization
      if (typeof raw !== 'string') return undefined
      return raw.replace(/^Bearer\s+/i, '').trim() || undefined
    },
  })
}
