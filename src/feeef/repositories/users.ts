import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import { AuthToken, UserEntity } from '../../core/entities/user.js'

/**
 * Represents the response returned by the authentication process.
 */
export interface AuthResponse {
  token: AuthToken
  user: UserEntity
}

/**
 * Represents a repository for managing user data.
 * Extends the ModelRepository class.
 */
export class UserRepository extends ModelRepository<UserEntity, any, any> {
  /**
   * Represents the authentication response.
   */
  auth: AuthResponse | null = null

  /**
   * Constructs a new UserRepository instance.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('users', client)
  }

  /**
   * Signs in a user with the provided credentials.
   * @param credentials - The user credentials.
   * @returns A promise that resolves to the authentication response.
   */
  async signin(credentials: any): Promise<AuthResponse> {
    // validate the input
    const output = credentials
    const res = await this.client.post(`/${this.resource}/auth/signin`, output)
    this.auth = res.data
    return res.data
  }

  /**
   * Signs up a new user with the provided credentials.
   * @param credentials - The user credentials.
   * @returns A promise that resolves to the authentication response.
   */
  async signup(credentials: any): Promise<AuthResponse> {
    // validate the input
    const output = credentials
    const res = await this.client.post(`/${this.resource}/auth/signup`, output)
    this.auth = res.data
    return res.data
  }

  /**
   * Signs out the currently authenticated user.
   * @returns A promise that resolves when the user is signed out.
   */
  async signout(): Promise<void> {
    this.auth = null
  }

  /**
   * Updates the authenticated user's data.
   * @param data - The updated user data.
   * @returns A promise that resolves to the updated user entity.
   */
  async updateMe(data: any): Promise<UserEntity> {
    const output = data
    const res = await this.client.put(`/${this.resource}/auth`, output)
    return res.data
  }
}
