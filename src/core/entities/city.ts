/**
 * City Entity
 *
 * Represents a city with composite key (countryCode + stateCode + name).
 */

export interface CityEntity {
  /** Country code (part of composite primary key) */
  countryCode: string

  /** State code (part of composite primary key) */
  stateCode: string

  /** City name (part of composite primary key) */
  name: string

  /** Additional metadata as key-value pairs */
  metadata: Record<string, any>

  /** Localized names by language code (e.g., { en: "New York", ar: "نيويورك" }) */
  locales?: Record<string, string>

  /** Creation timestamp */
  createdAt: any
}
