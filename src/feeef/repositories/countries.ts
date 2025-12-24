import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { CountryEntity } from '../../core/entities/country.js'

/**
 * Repository for managing Country entities.
 */
export class CountryRepository extends ModelRepository<CountryEntity, any, any> {
  /**
   * Constructs a new CountryRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('countries', client)
  }

  /**
   * Finds a country by its code (ID is the country code).
   * @param code - The country code (ISO 3166-1 alpha-2).
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the found Country entity.
   */
  async findByCode(code: string, params?: Record<string, any>): Promise<CountryEntity> {
    return this.find({ id: code.toUpperCase(), params })
  }
}
