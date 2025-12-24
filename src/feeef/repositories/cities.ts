import { AxiosInstance } from 'axios'
import { ModelRepository, ModelListOptions } from './repository.js'
import { CityEntity } from '../../core/entities/city.js'

/**
 * Repository for managing City entities.
 * Cities have composite keys (countryCode + stateCode + name) and are nested under states.
 */
export class CityRepository extends ModelRepository<CityEntity, any, any> {
  /**
   * Constructs a new CityRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('cities', client)
  }

  /**
   * Lists cities, optionally filtered by country code and/or state code.
   * @param options - The options for listing cities, including filters.
   * @returns A Promise that resolves to a list of City entities.
   */
  async list(
    options?: ModelListOptions & { countryCode?: string; stateCode?: string }
  ): Promise<any> {
    const { countryCode, stateCode, ...listOptions } = options || {}
    const params = {
      ...listOptions.params,
      ...(countryCode && { country_code: countryCode }),
      ...(stateCode && { state_code: stateCode }),
    }
    return super.list({ ...listOptions, params })
  }

  /**
   * Lists cities for a specific country and state (nested route).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of City entities.
   */
  async listByState(
    countryCode: string,
    stateCode: string,
    options?: ModelListOptions
  ): Promise<any> {
    const res = await this.client.get(`/countries/${countryCode}/states/${stateCode}/cities`, {
      params: {
        page: options?.page,
        offset: options?.offset,
        limit: options?.limit,
        ...options?.params,
      },
    })
    if (Array.isArray(res.data)) {
      return { data: res.data }
    } else {
      return {
        data: res.data.data,
        total: res.data.meta.total,
        page: res.data.meta.currentPage,
        limit: res.data.meta.perPage,
      }
    }
  }

  /**
   * Finds a city by country code, state code, and city name.
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param cityName - The city name.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the found City entity.
   */
  async findByName(
    countryCode: string,
    stateCode: string,
    cityName: string,
    params?: Record<string, any>
  ): Promise<CityEntity> {
    const res = await this.client.get(
      `/countries/${countryCode}/states/${stateCode}/cities/${cityName}`,
      { params }
    )
    return res.data
  }

  /**
   * Creates a new city (nested under country/state).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param data - The city data.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the created City entity.
   */
  async createByState(
    countryCode: string,
    stateCode: string,
    data: any,
    params?: Record<string, any>
  ): Promise<CityEntity> {
    const res = await this.client.post(
      `/countries/${countryCode}/states/${stateCode}/cities`,
      data,
      { params }
    )
    return res.data
  }

  /**
   * Updates a city (nested under country/state).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param cityName - The city name.
   * @param data - The update data.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the updated City entity.
   */
  async updateByState(
    countryCode: string,
    stateCode: string,
    cityName: string,
    data: any,
    params?: Record<string, any>
  ): Promise<CityEntity> {
    const res = await this.client.put(
      `/countries/${countryCode}/states/${stateCode}/cities/${cityName}`,
      data,
      { params }
    )
    return res.data
  }

  /**
   * Deletes a city (nested under country/state).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param cityName - The city name.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves when the city is deleted.
   */
  async deleteByState(
    countryCode: string,
    stateCode: string,
    cityName: string,
    params?: Record<string, any>
  ): Promise<void> {
    await this.client.delete(`/countries/${countryCode}/states/${stateCode}/cities/${cityName}`, {
      params,
    })
  }

  /**
   * Searches cities by name (autocomplete).
   * @param query - The search query.
   * @param options - Optional filters (countryCode, stateCode).
   * @returns A Promise that resolves to a list of matching City entities.
   */
  async search(
    query: string,
    options?: { countryCode?: string; stateCode?: string }
  ): Promise<CityEntity[]> {
    const params: Record<string, any> = { q: query }
    if (options?.countryCode) params.country_code = options.countryCode
    if (options?.stateCode) params.state_code = options.stateCode

    const res = await this.client.get('/cities/search', { params })
    return res.data
  }
}
