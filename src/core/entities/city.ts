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

  /** Creation timestamp */
  createdAt: any
}
