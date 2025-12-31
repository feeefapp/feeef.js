/**
 * Shipping Price Entity
 *
 * A simplified, country-aware shipping pricing system that replaces
 * the legacy array-based shipping rates with a structured approach.
 *
 * Key features:
 * - Country codes as keys (ISO 3166-1 alpha-2)
 * - State codes as keys (no fragile array indexes)
 * - Named price types for extensibility
 * - Gradual migration path from legacy system
 *
 * @example
 * ```typescript
 * const prices: ShippingPriceRates = {
 *   "DZ": {
 *     "01": { home: 800, desk: 400, pickup: 0 },
 *     "16": { home: 600, desk: 300, pickup: 0 }
 *   },
 *   "IQ": {
 *     "01": { home: 15000, desk: 10000, pickup: 5000 }
 *   }
 * }
 * ```
 */

/**
 * Individual state shipping rates with named price types.
 * Using named properties instead of array indexes for clarity and extensibility.
 */
export interface ShippingStateRates {
  /** Price for home delivery (nullable if unavailable) */
  home: number | null
  /** Price for desk/office pickup (nullable if unavailable) */
  desk: number | null
  /** Price for store pickup (nullable if unavailable) */
  pickup: number | null
}

/**
 * Shipping rates organized by country code and state code.
 * Structure: { [countryCode]: { [stateCode]: ShippingStateRates } }
 */
export type ShippingPriceRates = Record<string, Record<string, ShippingStateRates>>

/**
 * Status of the shipping price configuration.
 */
export enum ShippingPriceStatus {
  /** Not yet published, only visible to store owner */
  draft = 'draft',
  /** Active and used for shipping calculations */
  published = 'published',
}

/**
 * Shipping Price Entity
 *
 * Represents a shipping pricing configuration for a store.
 * Supports multi-country operations with state-level pricing.
 */
export interface ShippingPriceEntity {
  /** Unique identifier (24-char string) */
  id: string

  /** Display name for this pricing configuration */
  name: string

  /** Optional logo URL for branding */
  logoUrl: string | null

  /** Store this pricing belongs to */
  storeId: string

  /**
   * Pricing data structured by country and state codes.
   * @see ShippingPriceRates
   */
  prices: ShippingPriceRates

  /** Publication status */
  status: ShippingPriceStatus

  /** Creation timestamp */
  createdAt: any

  /** Last update timestamp */
  updatedAt: any
}

/**
 * Shipping type enumeration for order shipping type.
 * Maps to the pricing structure keys.
 */
export type ShippingPriceType = keyof ShippingStateRates

/**
 * Helper function to get shipping price from rates.
 *
 * @param prices - The shipping price rates object
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param stateCode - State/province code
 * @param type - Shipping type (home, desk, pickup)
 * @returns The price or null if not available
 *
 * @example
 * ```typescript
 * const price = getShippingPrice(shippingPrice.prices, 'DZ', '16', 'home')
 * // Returns 600 or null
 * ```
 */
export function getShippingPrice(
  prices: ShippingPriceRates,
  countryCode: string,
  stateCode: string,
  type: ShippingPriceType
): number | null {
  const countryRates = prices[countryCode]
  if (!countryRates) return null

  const stateRates = countryRates[stateCode]
  if (!stateRates) return null

  return stateRates[type] ?? null
}

/**
 * Helper function to check if shipping is available for a location.
 *
 * @param prices - The shipping price rates object
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param stateCode - State/province code
 * @returns True if any shipping type is available for this location
 */
export function isShippingAvailable(
  prices: ShippingPriceRates,
  countryCode: string,
  stateCode: string
): boolean {
  const countryRates = prices[countryCode]
  if (!countryRates) return false

  const stateRates = countryRates[stateCode]
  if (!stateRates) return false

  return stateRates.home !== null || stateRates.desk !== null || stateRates.pickup !== null
}

/**
 * Helper function to get all available shipping types for a location.
 *
 * @param prices - The shipping price rates object
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param stateCode - State/province code
 * @returns Array of available shipping types with their prices
 */
export function getAvailableShippingTypes(
  prices: ShippingPriceRates,
  countryCode: string,
  stateCode: string
): Array<{ type: ShippingPriceType; price: number }> {
  const countryRates = prices[countryCode]
  if (!countryRates) return []

  const stateRates = countryRates[stateCode]
  if (!stateRates) return []

  const available: Array<{ type: ShippingPriceType; price: number }> = []

  if (stateRates.home !== null) {
    available.push({ type: 'home', price: stateRates.home })
  }
  if (stateRates.desk !== null) {
    available.push({ type: 'desk', price: stateRates.desk })
  }
  if (stateRates.pickup !== null) {
    available.push({ type: 'pickup', price: stateRates.pickup })
  }

  return available
}

/**
 * Input data for creating a new shipping price
 */
export interface ShippingPriceCreateInput {
  name: string
  storeId: string
  logoUrl?: string
  prices: ShippingPriceRates
  status?: ShippingPriceStatus
}

/**
 * Input data for updating an existing shipping price
 */
export interface ShippingPriceUpdateInput {
  name?: string
  logoUrl?: string
  prices?: ShippingPriceRates
  status?: ShippingPriceStatus
}
