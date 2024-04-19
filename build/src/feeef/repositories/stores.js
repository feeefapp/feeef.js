import vine from "@vinejs/vine";
import { CreateStoreSchema } from "../validators/stores";
import { ModelRepository } from "./repository";
/**
 * Repository for managing Store entities.
 */
export class StoreRepository extends ModelRepository {
    /**
     * Constructs a new StoreRepository instance.
     * @param client The AxiosInstance used for making HTTP requests.
     */
    constructor(client) {
        super("stores", client);
    }
    /**
     * Creates a new Store entity.
     * @param options The options for creating the Store entity.
     * @returns A Promise that resolves to the created Store entity.
     */
    async create(options) {
        const validator = vine.compile(CreateStoreSchema);
        const output = await validator.validate(options.data);
        return super.create({ ...options, data: output });
    }
}
