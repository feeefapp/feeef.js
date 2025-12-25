import { AxiosInstance } from 'axios'
import { ModelRepository } from './repository.js'
import {
  AccessToken,
  AuthToken,
  CreateUserOptions,
  FinishPasskeyAuthenticationOptions,
  FinishPasskeyRegistrationOptions,
  LinkSocialAccountOptions,
  Passkey,
  SigninCredentials,
  SigninWithSocialOptions,
  SignupCredentials,
  TransferMoneyOptions,
  TransferMoneyResponse,
  UpdateUserOptions,
  UserEntity,
  UserUpdate,
  StartPasskeyAuthenticationOptions,
  StartPasskeyRegistrationOptions,
} from '../../core/entities/user.js'

/**
 * Represents the response returned by the authentication process.
 */
export interface AuthResponse {
  token: AuthToken
  user: UserEntity
}

/**
 * Represents a repository for managing user data and authentication.
 * Extends the ModelRepository class with authentication capabilities.
 */
export class UserRepository extends ModelRepository<
  UserEntity,
  CreateUserOptions,
  UpdateUserOptions
> {
  /**
   * Represents the current authentication response.
   * Set automatically after signin, signup, or signinWithToken.
   */
  private _auth: AuthResponse | null = null

  /**
   * Gets the current authentication response.
   */
  get auth(): AuthResponse | null {
    return this._auth
  }

  /**
   * Sets the authentication response and updates the Authorization header.
   */
  private set auth(value: AuthResponse | null) {
    this._auth = value
    if (value?.token?.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${value.token.token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  /**
   * Constructs a new UserRepository instance.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('users', client)
  }

  /**
   * Signs in a user with the provided credentials.
   * @param credentials - The user credentials (email, password, optional fcmToken).
   * @returns A promise that resolves to the authentication response.
   */
  async signin(credentials: SigninCredentials): Promise<AuthResponse> {
    const res = await this.client.post(`/${this.resource}/auth/signin`, credentials)
    this.auth = res.data
    return this.auth!
  }

  /**
   * Signs up a new user with the provided credentials.
   * @param credentials - The user signup credentials.
   * @returns A promise that resolves to the authentication response.
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const res = await this.client.post(`/${this.resource}/auth/signup`, credentials)
    this.auth = res.data
    return this.auth!
  }

  /**
   * Signs in a user with an existing token.
   * Useful for restoring authentication state from localStorage.
   * @param token - The authentication token.
   * @param fcmToken - Optional FCM token for push notifications.
   * @returns A promise that resolves to the authentication response.
   */
  async signinWithToken(token: string, fcmToken?: string | null): Promise<AuthResponse> {
    // Set the token in headers first
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Call the me endpoint to get user data
    const res = await this.client.get(`/${this.resource}/auth`)

    // Update FCM token if provided
    if (fcmToken) {
      try {
        await this.client.post(`/${this.resource}/auth/fcm-token`, { fcmToken })
      } catch (e) {
        // Ignore FCM token update errors
        console.warn('Failed to update FCM token:', e)
      }
    }

    this.auth = {
      user: res.data.user,
      token: { ...res.data.token, token },
    }

    return this.auth!
  }

  /**
   * Signs out the currently authenticated user.
   * Deletes the token on the server and clears local auth state.
   * @returns A promise that resolves when the user is signed out.
   */
  async signout(): Promise<void> {
    if (this.auth) {
      try {
        await this.client.post(`/${this.resource}/auth/signout`)
      } catch (e) {
        // Even if the request fails, clear local auth state
        console.warn('Signout request failed:', e)
      }
    }
    this.auth = null
  }

  /**
   * Gets the currently authenticated user.
   * @returns A promise that resolves to the authentication response with current user.
   */
  async me(): Promise<AuthResponse> {
    const res = await this.client.get(`/${this.resource}/auth`)
    this.auth = res.data
    return this.auth!
  }

  /**
   * Updates the authenticated user's profile.
   * @param data - The updated user data.
   * @returns A promise that resolves to the updated user entity.
   */
  async updateMe(data: UserUpdate): Promise<UserEntity> {
    const res = await this.client.put(`/${this.resource}/auth`, data)
    // Update local auth state if user was updated
    if (this.auth) {
      this.auth = {
        ...this.auth,
        user: res.data,
      }
    }
    return res.data
  }

  /**
   * Sends a password reset email to the user.
   * @param email - The user's email address.
   * @returns A promise that resolves when the email is sent.
   */
  async sendResetPasswordEmail(email: string): Promise<void> {
    await this.client.post(`/${this.resource}/auth/reset-password`, null, {
      params: { email },
    })
  }

  /**
   * Resets the password using a token from the reset email.
   * @param uid - The user ID.
   * @param token - The reset token from the email.
   * @returns A promise that resolves when the password is reset.
   */
  async resetPasswordWithToken(uid: string, token: string): Promise<void> {
    await this.client.get(`/${this.resource}/auth/reset-password`, {
      params: { uid, token },
    })
  }

  /**
   * Gets all access tokens for the authenticated user.
   * @returns A promise that resolves to an array of access tokens.
   */
  async tokens(): Promise<AccessToken[]> {
    const res = await this.client.get(`/${this.resource}/auth/tokens`)
    return res.data
  }

  /**
   * Signs in with Google OAuth.
   * @param options - The OAuth code and optional FCM token.
   * @returns A promise that resolves to the authentication response.
   */
  async signinWithGoogle(options: SigninWithSocialOptions): Promise<AuthResponse> {
    const res = await this.client.post('/social/google/callback', {
      code: options.code,
      fcmToken: options.fcmToken,
    })
    this.auth = res.data
    return this.auth!
  }

  /**
   * Signs in with GitHub OAuth.
   * @param options - The OAuth code and optional FCM token.
   * @returns A promise that resolves to the authentication response.
   */
  async signinWithGitHub(options: SigninWithSocialOptions): Promise<AuthResponse> {
    const res = await this.client.post('/social/github/callback', {
      code: options.code,
      fcmToken: options.fcmToken,
    })
    this.auth = res.data
    return this.auth!
  }

  /**
   * Signs in with Apple OAuth.
   * @param options - The OAuth code and optional FCM token.
   * @returns A promise that resolves to the authentication response.
   */
  async signinWithApple(options: SigninWithSocialOptions): Promise<AuthResponse> {
    const res = await this.client.post('/social/apple/callback', {
      code: options.code,
      fcmToken: options.fcmToken,
    })
    this.auth = res.data
    return this.auth!
  }

  /**
   * Links a social account to the current user.
   * @param options - The provider and OAuth code.
   * @returns A promise that resolves to the updated user entity.
   */
  async linkSocialAccount(options: LinkSocialAccountOptions): Promise<UserEntity> {
    const res = await this.client.post(`/social/${options.provider}/link/callback`, {
      code: options.code,
    })
    // Update local auth state if it's the current user
    if (this.auth && this.auth.user.id === res.data.user.id) {
      this.auth = {
        ...this.auth,
        user: res.data.user,
      }
    }
    return res.data.user
  }

  /**
   * Unlinks a social account from the current user.
   * @param provider - The social provider to unlink.
   * @returns A promise that resolves to the updated user entity.
   */
  async unlinkSocialAccount(provider: 'google' | 'github' | 'apple'): Promise<UserEntity> {
    const res = await this.client.post('/social/unlink', { provider })
    // Update local auth state if it's the current user
    if (this.auth && this.auth.user.id === res.data.user.id) {
      this.auth = {
        ...this.auth,
        user: res.data.user,
      }
    }
    return res.data.user
  }

  /**
   * Transfers money from the authenticated user to another user.
   * @param options - Transfer options including recipient and amount.
   * @returns A promise that resolves to the transfer response with updated users.
   */
  async transferMoney(options: TransferMoneyOptions): Promise<TransferMoneyResponse> {
    const res = await this.client.post(`/${this.resource}/auth/transfer`, options)
    // Update local auth state if sender is the current user
    if (this.auth && this.auth.user.id === res.data.sender.id) {
      this.auth = {
        ...this.auth,
        user: res.data.sender,
      }
    }
    return res.data
  }

  /**
   * Starts passkey registration.
   * @param options - Optional device name for the passkey.
   * @returns A promise that resolves to the registration challenge data.
   */
  async startPasskeyRegistration(
    options?: StartPasskeyRegistrationOptions
  ): Promise<Record<string, any>> {
    const res = await this.client.post('/passkeys/register/start', {
      deviceName: options?.deviceName,
    })
    return res.data
  }

  /**
   * Finishes passkey registration.
   * @param options - The registration response from the authenticator.
   * @returns A promise that resolves to the authentication response.
   */
  async finishPasskeyRegistration(
    options: FinishPasskeyRegistrationOptions
  ): Promise<AuthResponse> {
    const res = await this.client.post('/passkeys/register/finish', {
      response: options.registrationResponse,
      deviceName: options.deviceName,
    })
    this.auth = res.data
    return this.auth!
  }

  /**
   * Starts passkey authentication.
   * @param options - Optional email to identify the user.
   * @returns A promise that resolves to the authentication challenge data.
   */
  async startPasskeyAuthentication(
    options?: StartPasskeyAuthenticationOptions
  ): Promise<Record<string, any>> {
    const res = await this.client.post('/passkeys/authenticate/start', {
      email: options?.email,
    })
    return res.data
  }

  /**
   * Finishes passkey authentication.
   * @param options - The authentication response from the authenticator.
   * @returns A promise that resolves to the authentication response.
   */
  async finishPasskeyAuthentication(
    options: FinishPasskeyAuthenticationOptions
  ): Promise<AuthResponse> {
    const res = await this.client.post('/passkeys/authenticate/finish', {
      response: options.authenticationResponse,
    })
    this.auth = res.data
    return this.auth!
  }

  /**
   * Lists all passkeys for the authenticated user.
   * @returns A promise that resolves to an array of passkeys.
   */
  async listPasskeys(): Promise<Passkey[]> {
    const res = await this.client.get('/passkeys')
    return res.data.passkeys || []
  }

  /**
   * Deletes a passkey.
   * @param passkeyId - The ID of the passkey to delete.
   * @returns A promise that resolves when the passkey is deleted.
   */
  async deletePasskey(passkeyId: string): Promise<void> {
    await this.client.delete(`/passkeys/${passkeyId}`)
  }
}
