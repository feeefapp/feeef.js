/**
 * City Entity
 *
 * No separate `id` or `code`: identity is **countryCode + stateCode + name**.
 * Use **`name`** (English-normalized) for stored values, shipping payloads, and
 * `<option value>` — not a translated string from `locales`.
 */

export interface CityEntity {
  /** Country code (part of composite primary key) */
  countryCode: string

  /** State code (part of composite primary key) */
  stateCode: string

  /**
   * Canonical English-normalized city name (part of composite primary key).
   * This is the value to persist (`shippingCity`, cart address) and to use as
   * the select value — not `locales.ar` etc.
   */
  name: string

  /** Additional metadata as key-value pairs */
  metadata: Record<string, any>

  /** Display-only translations keyed by language code (`ar`, `en`, `fr`, …). */
  locales?: Record<string, string>

  /** Creation timestamp */
  createdAt: any
}
