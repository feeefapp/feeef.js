import { InferInput } from "@vinejs/vine/types";
import { AxiosInstance } from "axios";
import { StoreEntity } from "../../core/core";
import { CreateStoreSchema } from "../validators/stores";
import { CreateUserStoreSchema, UpdateUserStoreSchema } from "../validators/user_stores";
import { ModelRepository, ModelCreateOptions } from "./repository";
/**
 * Repository for managing Store entities.
 */
export declare class StoreRepository extends ModelRepository<StoreEntity, InferInput<typeof CreateUserStoreSchema>, InferInput<typeof UpdateUserStoreSchema>> {
    /**
     * Constructs a new StoreRepository instance.
     * @param client The AxiosInstance used for making HTTP requests.
     */
    constructor(client: AxiosInstance);
    /**
     * Creates a new Store entity.
     * @param options The options for creating the Store entity.
     * @returns A Promise that resolves to the created Store entity.
     */
    create(options: ModelCreateOptions<InferInput<typeof CreateStoreSchema>>): Promise<StoreEntity>;
}
