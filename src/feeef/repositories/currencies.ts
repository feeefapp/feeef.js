import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { CurrencyEntity } from '../../core/entities/currency.js'

/**
 * Repository for managing Currency entities.
 */
export class CurrencyRepository extends ModelRepository<CurrencyEntity, any, any> {
  /**
   * Constructs a new CurrencyRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('currencies', client)
  }

  /**
   * Finds a currency by its code (ID is the currency code).
   * @param code - The currency code (ISO 4217, e.g., USD, EUR).
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the found Currency entity.
   */
  async findByCode(code: string, params?: Record<string, any>): Promise<CurrencyEntity> {
    return this.find({ id: code.toUpperCase(), params })
  }
}
