import { AxiosInstance } from 'axios'
import { ModelRepository, ModelListOptions } from './repository.js'
import { StateEntity } from '../../core/entities/state.js'

/**
 * Repository for managing State entities.
 * States have composite keys (countryCode + code) and can be nested under countries.
 */
export class StateRepository extends ModelRepository<StateEntity, any, any> {
  /**
   * Constructs a new StateRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('states', client)
  }

  /**
   * Lists states, optionally filtered by country code.
   * @param options - The options for listing states, including countryCode filter.
   * @returns A Promise that resolves to a list of State entities.
   */
  async list(options?: ModelListOptions & { countryCode?: string }): Promise<any> {
    const { countryCode, ...listOptions } = options || {}
    const params = {
      ...listOptions.params,
      ...(countryCode && { country_code: countryCode }),
    }
    return super.list({ ...listOptions, params })
  }

  /**
   * Lists states for a specific country (nested route).
   * @param countryCode - The country code.
   * @param options - Optional list options.
   * @returns A Promise that resolves to a list of State entities.
   */
  async listByCountry(countryCode: string, options?: ModelListOptions): Promise<any> {
    const res = await this.client.get(`/countries/${countryCode}/states`, {
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
   * Finds a state by country code and state code.
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the found State entity.
   */
  async findByCode(
    countryCode: string,
    stateCode: string,
    params?: Record<string, any>
  ): Promise<StateEntity> {
    const res = await this.client.get(`/countries/${countryCode}/states/${stateCode}`, { params })
    return res.data
  }

  /**
   * Creates a new state (nested under country).
   * @param countryCode - The country code.
   * @param data - The state data.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the created State entity.
   */
  async createByCountry(
    countryCode: string,
    data: any,
    params?: Record<string, any>
  ): Promise<StateEntity> {
    const res = await this.client.post(`/countries/${countryCode}/states`, data, { params })
    return res.data
  }

  /**
   * Updates a state (nested under country).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param data - The update data.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the updated State entity.
   */
  async updateByCountry(
    countryCode: string,
    stateCode: string,
    data: any,
    params?: Record<string, any>
  ): Promise<StateEntity> {
    const res = await this.client.put(`/countries/${countryCode}/states/${stateCode}`, data, {
      params,
    })
    return res.data
  }

  /**
   * Deletes a state (nested under country).
   * @param countryCode - The country code.
   * @param stateCode - The state code.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves when the state is deleted.
   */
  async deleteByCountry(
    countryCode: string,
    stateCode: string,
    params?: Record<string, any>
  ): Promise<void> {
    await this.client.delete(`/countries/${countryCode}/states/${stateCode}`, { params })
  }
}
