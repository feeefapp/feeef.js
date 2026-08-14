/**
 * OAuth / member RBAC scope catalog — aligned with backend
 * `app/oauth_scopes.ts` (`MEMBER_SCOPES` + `auth`, `apps`).
 *
 * Keep this list in sync when adding a store resource. Unknown strings are
 * rejected by the API validators.
 */

/** Store member RBAC scopes (parent implies `.read` child). */
export const MEMBER_SCOPES = [
  'store',
  'store.read',
  'store.settings',
  'store.integrations',
  'store.members',
  'orders',
  'orders.read',
  'products',
  'products.read',
  'categories',
  'categories.read',
  'pages',
  'pages.read',
  'product_landing_pages',
  'product_landing_pages.read',
  'shipping_prices',
  'shipping_prices.read',
  'template_components',
  'template_components.read',
  'store_templates',
  'store_templates.read',
  'finance',
  'finance.read',
  'inventory',
  'inventory.read',
] as const

export type MemberScope = (typeof MEMBER_SCOPES)[number]

/** Scopes for developer tooling / delegation (not store-specific RBAC). */
export const OAUTH_PLATFORM_SCOPES = ['auth', 'apps'] as const

/**
 * Identity-only grant when an app is registered without scopes.
 * Never `*` — empty registration must not escalate to full access.
 */
export const DEFAULT_OAUTH_SCOPES = ['auth'] as const

/** Every scope string allowed on OAuth apps and access tokens. */
export const OAUTH_SCOPES = [...MEMBER_SCOPES, ...OAUTH_PLATFORM_SCOPES] as const

export type OAuthScope = (typeof OAUTH_SCOPES)[number]
