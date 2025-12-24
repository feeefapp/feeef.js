/**
 * Currency Entity
 *
 * Represents a currency with ISO 4217 code.
 */
export interface CurrencyEntity {
  /** ISO 4217 currency code (e.g., USD, EUR, SAR) */
  code: string

  /** Currency name (e.g., US Dollar, Euro, Saudi Riyal) */
  name: string

  /** Currency symbol (e.g., $, €, ﷼) */
  symbol?: string

  /** Number of decimal places */
  decimals: number

  /** Exchange rate relative to base currency */
  rate: number

  /** Additional metadata as key-value pairs */
  metadata?: Record<string, any>

  /** Creation timestamp */
  createdAt: any
}
