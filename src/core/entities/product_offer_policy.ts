import type { ProductEntity, ProductOffer } from './product.js'

/** Minimal product shape needed to resolve default / forced offer policy. */
export type ProductOfferPolicySource = Pick<
  ProductEntity,
  'offers' | 'forceOffer' | 'defaultOfferCode'
> & {
  /** Defensive: some payloads / caches may still emit snake_case. */
  force_offer?: boolean | null
  default_offer_code?: string | null
}

function readForceOffer(product: ProductOfferPolicySource): boolean {
  return product.forceOffer === true || product.force_offer === true
}

function readDefaultOfferCode(product: ProductOfferPolicySource): string | null {
  const code = product.defaultOfferCode ?? product.default_offer_code
  if (typeof code !== 'string') return null
  const trimmed = code.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Returns [defaultOfferCode] only when it exists in [offers]; otherwise null.
 * Use whenever persisting or applying a default so stale codes never leak.
 */
export function syncDefaultOfferCode(
  offers: ProductOffer[] | null | undefined,
  defaultOfferCode: string | null | undefined
): string | null {
  if (!defaultOfferCode || !offers?.length) return null
  return offers.some((o) => o.code === defaultOfferCode) ? defaultOfferCode : null
}

/**
 * Offer that should be preselected for a product (if any).
 * Respects synced [defaultOfferCode] only — does not invent a "first offer".
 */
export function resolveInitialProductOffer(
  product: ProductOfferPolicySource
): ProductOffer | undefined {
  const code = syncDefaultOfferCode(product.offers, readDefaultOfferCode(product))
  if (!code || !product.offers?.length) return undefined
  return product.offers.find((o) => o.code === code)
}

/**
 * True when the product requires an offer to remain selected (cannot deselect).
 * Independent of whether a specific default code is set.
 */
export function isProductOfferRequired(product: ProductOfferPolicySource): boolean {
  return readForceOffer(product)
}

/**
 * True when offer selection is locked to the synced default code
 * (`forceOffer` + valid `defaultOfferCode`). Customer cannot switch offers.
 */
export function isProductOfferLocked(product: ProductOfferPolicySource): boolean {
  if (!readForceOffer(product)) return false
  return syncDefaultOfferCode(product.offers, readDefaultOfferCode(product)) !== null
}

/**
 * Offer that must be applied when locked; otherwise undefined.
 */
export function resolveForcedProductOffer(
  product: ProductOfferPolicySource
): ProductOffer | undefined {
  if (!isProductOfferLocked(product)) return undefined
  return resolveInitialProductOffer(product)
}
