import type { ProductEntity, ProductOffer } from './product.js'

/** Minimal product shape needed to resolve default / forced offer policy. */
export type ProductOfferPolicySource = Pick<
  ProductEntity,
  'offers' | 'forceOffer' | 'defaultOfferCode'
>

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
  const code = syncDefaultOfferCode(product.offers, product.defaultOfferCode)
  if (!code || !product.offers?.length) return undefined
  return product.offers.find((o) => o.code === code)
}

/**
 * True when the product requires an offer to remain selected (cannot deselect).
 * Independent of whether a specific default code is set.
 */
export function isProductOfferRequired(product: ProductOfferPolicySource): boolean {
  return product.forceOffer === true
}

/**
 * True when offer selection is locked to the synced default code
 * (`forceOffer` + valid `defaultOfferCode`). Customer cannot switch offers.
 */
export function isProductOfferLocked(product: ProductOfferPolicySource): boolean {
  if (product.forceOffer !== true) return false
  return syncDefaultOfferCode(product.offers, product.defaultOfferCode) !== null
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
