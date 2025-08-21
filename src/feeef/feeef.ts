import axios, { AxiosInstance } from 'axios'
// import { buildMemoryStorage, buildWebStorage, setupCache } from 'axios-cache-interceptor'
import { OrderRepository } from './repositories/orders.js'
import { ProductRepository } from './repositories/products.js'
import { StoreRepository } from './repositories/stores.js'
import { UserRepository } from './repositories/users.js'
import { DepositRepository } from './repositories/deposits.js'
import { CartService } from './services/cart.js'

/**
 * Configuration options for the FeeeF module.
 */
export interface FeeeFConfig {
  /**
   * The API key to be used for authentication.
   */
  apiKey: string

  /**
   * An optional Axios instance to be used for making HTTP requests.
   */
  client?: AxiosInstance

  /**
   * Specifies whether caching should be enabled or disabled.
   * If set to a number, it represents the maximum number of seconds to cache the responses.
   * If set to `false`, caching will be disabled (5s).
   * cannot be less than 5 seconds
   */
  cache?: false | number

  /**
   * The base URL for the API.
   */
  baseURL?: string
}

/**
 * Represents the FeeeF class.
 */
export class FeeeF {
  /**
   * The API key used for authentication.
   */
  apiKey: string

  /**
   * The Axios instance used for making HTTP requests.
   */
  client: AxiosInstance

  /**
   * The repository for managing stores.
   */
  stores: StoreRepository

  /**
   * The repository for managing products.
   */
  products: ProductRepository

  /**
   * The repository for managing users.
   */
  users: UserRepository

  /**
   * The repository for managing orders.
   */
  orders: OrderRepository

  /**
   * The repository for managing deposits.
   */
  deposits: DepositRepository

  /**
   * The cart service for managing the cart.
   */
  cart: CartService

  /**
   * Constructs a new instance of the FeeeF class.
   * @param {FeeeFConfig} config - The configuration object.
   * @param {string} config.apiKey - The API key used for authentication.
   * @param {AxiosInstance} config.client - The Axios instance used for making HTTP requests.
   * @param {boolean | number} config.cache - The caching configuration. Set to `false` to disable caching, or provide a number to set the cache TTL in milliseconds.
   */
  //
  constructor({ apiKey, client, cache, baseURL = 'http://localhost:3333/api/v1' }: FeeeFConfig) {
    console.log('feeef super cache', cache)
    this.apiKey = apiKey
    // get th "cache" search param
    // const urlParams = new URLSearchParams(window.location.search)
    // const cacheParam = urlParams.get('cache')
    // if is 0 or false, disable cache
    // if (cacheParam == '0') {
    this.client = client || axios
    // set the api key
    this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`
    // } else {
    //   this.client = setupCache(client || axios, {
    //     ttl: cache === false ? 5 : Math.max(cache!, 5) || 1 * 60 * 1000, // 1 minute by default
    //     // for persistent cache use buildWebStorage
    //     storage: buildWebStorage(localStorage, 'ff:'),
    //   })
    // }
    // set base url
    this.client.defaults.baseURL = baseURL
    this.stores = new StoreRepository(this.client)
    this.products = new ProductRepository(this.client)
    this.users = new UserRepository(this.client)
    this.orders = new OrderRepository(this.client)
    this.deposits = new DepositRepository(this.client)

    // cart
    this.cart = new CartService()
  }
}
