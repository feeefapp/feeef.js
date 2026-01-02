/**
 * State/Province Entity
 *
 * Represents a state or province with composite key (countryCode + code).
 */

export interface StateEntity {
  /** Country code (part of composite primary key) */
  countryCode: string

  /** State/province code (part of composite primary key) */
  code: string

  /** State/province name */
  name: string

  /** Additional metadata as key-value pairs */
  metadata: Record<string, any>

  /** Localized names by language code (e.g., { en: "California", ar: "كاليفورنيا" }) */
  locales?: Record<string, string>

  /** Creation timestamp */
  createdAt: any
}
