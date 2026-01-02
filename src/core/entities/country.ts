/**
 * Country Entity
 *
 * Represents a country with ISO 3166-1 alpha-2 country code.
 */

export interface CountryEntity {
  /** ISO 3166-1 alpha-2 country code (e.g., US, DZ, SA) */
  code: string

  /** Country name (e.g., United States, Algeria, Saudi Arabia) */
  name: string

  /** Phone country code without + (e.g., 1, 213, 966) */
  phone: string

  /** Additional metadata as key-value pairs */
  metadata: Record<string, any>

  /** Localized names by language code (e.g., { en: "United States", ar: "الولايات المتحدة" }) */
  locales?: Record<string, string>

  /** Creation timestamp */
  createdAt: any
}
