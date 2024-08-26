import axios, { AxiosInstance } from "axios";
import {
  buildMemoryStorage,
  buildWebStorage,
  setupCache,
} from "axios-cache-interceptor";
import { OrderRepository } from "./repositories/orders";
import { ProductRepository } from "./repositories/products";
import { StoreRepository } from "./repositories/stores";
import { UserRepository } from "./repositories/users";

/**
 * Configuration options for the FeeeF module.
 */
export interface FeeeFConfig {
  /**
   * The API key to be used for authentication.
   */
  apiKey: string;

  /**
   * An optional Axios instance to be used for making HTTP requests.
   */
  client?: AxiosInstance;

  /**
   * Specifies whether caching should be enabled or disabled.
   * If set to a number, it represents the maximum number of seconds to cache the responses.
   * If set to `false`, caching will be disabled (5s).
   * cannot be less than 5 seconds
   */
  cache?: false | number;

  /**
   * The base URL for the API.
   */
  baseURL?: string;
}

/**
 * Represents the FeeeF class.
 */
export class FeeeF {
  /**
   * The API key used for authentication.
   */
  apiKey: string;

  /**
   * The Axios instance used for making HTTP requests.
   */
  client: AxiosInstance;

  /**
   * The repository for managing stores.
   */
  stores: StoreRepository;

  /**
   * The repository for managing products.
   */
  products: ProductRepository;

  /**
   * The repository for managing users.
   */
  users: UserRepository;

  /**
   * The repository for managing orders.
   */
  orders: OrderRepository;

  /**
   * Constructs a new instance of the FeeeF class.
   * @param {FeeeFConfig} config - The configuration object.
   * @param {string} config.apiKey - The API key used for authentication.
   * @param {AxiosInstance} config.client - The Axios instance used for making HTTP requests.
   * @param {boolean | number} config.cache - The caching configuration. Set to `false` to disable caching, or provide a number to set the cache TTL in milliseconds.
   */
  constructor({
    apiKey,
    client,
    cache,
    baseURL = "http://localhost:3333/api/v1",
  }: FeeeFConfig) {
    this.apiKey = apiKey;
    // get th "cache" search param
    // if is 0 or false, disable cache
    if (cache === false) {
      this.client = client || axios;
    } else {
      const isInBrowser =
        typeof window !== "undefined" && typeof localStorage !== "undefined";
      this.client = setupCache(client || axios, {
        ttl: cache === undefined ? 1000 * 60 * 5 : Math.max(cache!, 1000), //|| 1 * 60 * 1000, // 1 minute by default
        // for persistent cache use buildWebStorage
        storage: isInBrowser
          ? buildWebStorage(localStorage, "ff:")
          : buildMemoryStorage(),
      });
    }
    // set base url
    this.client.defaults.baseURL = baseURL;
    this.stores = new StoreRepository(this.client);
    this.products = new ProductRepository(this.client);
    this.users = new UserRepository(this.client);
    this.orders = new OrderRepository(this.client);
  }
}
