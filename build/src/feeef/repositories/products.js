import { ModelRepository } from "./repository";
/**
 * Represents a repository for managing products.
 */
export class ProductRepository extends ModelRepository {
    /**
     * Creates a new instance of the ProductRepository class.
     * @param client - The AxiosInstance used for making HTTP requests.
     */
    constructor(client) {
        super("products", client);
    }
}
