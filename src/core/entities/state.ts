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

  /** Creation timestamp */
  createdAt: any
}
