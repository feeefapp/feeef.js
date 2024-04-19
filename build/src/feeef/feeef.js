import axios from "axios";
import { buildWebStorage, setupCache } from "axios-cache-interceptor";
import { OrderRepository } from "./repositories/orders";
import { ProductRepository } from "./repositories/products";
import { StoreRepository } from "./repositories/stores";
import { UserRepository } from "./repositories/users";
/**
 * Represents the FeeeF class.
 */
export class FeeeF {
    /**
     * The API key used for authentication.
     */
    apiKey;
    /**
     * The Axios instance used for making HTTP requests.
     */
    client;
    /**
     * The repository for managing stores.
     */
    stores;
    /**
     * The repository for managing products.
     */
    products;
    /**
     * The repository for managing users.
     */
    users;
    /**
     * The repository for managing orders.
     */
    orders;
    /**
     * Constructs a new instance of the FeeeF class.
     * @param {FeeeFConfig} config - The configuration object.
     * @param {string} config.apiKey - The API key used for authentication.
     * @param {AxiosInstance} config.client - The Axios instance used for making HTTP requests.
     * @param {boolean | number} config.cache - The caching configuration. Set to `false` to disable caching, or provide a number to set the cache TTL in milliseconds.
     */
    constructor({ apiKey, client, cache }) {
        this.apiKey = apiKey;
        // get th "cache" search param
        const urlParams = new URLSearchParams(window.location.search);
        const cacheParam = urlParams.get("cache");
        // if is 0 or false, disable cache
        if (cacheParam == '0') {
            this.client = client || axios;
        }
        else {
            this.client = setupCache(client || axios, {
                ttl: cache === false ? 5 : Math.max(cache, 5) || 1 * 60 * 1000,
                // for persistent cache use buildWebStorage
                storage: buildWebStorage(localStorage, "ff:"),
            });
        }
        // set base url
        this.client.defaults.baseURL = "http://localhost:3333/api/v1";
        this.stores = new StoreRepository(this.client);
        this.products = new ProductRepository(this.client);
        this.users = new UserRepository(this.client);
        this.orders = new OrderRepository(this.client);
    }
}
