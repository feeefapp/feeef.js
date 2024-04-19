import { InferInput } from "@vinejs/vine/types";
import { AxiosInstance } from "axios";
import { ProductEntity } from "../../core/core";
import { CreateProductSchema, UpdateProductSchema } from "../validators/product";
import { ModelRepository } from "./repository";
/**
 * Represents a repository for managing products.
 */
export declare class ProductRepository extends ModelRepository<ProductEntity, InferInput<typeof CreateProductSchema>, InferInput<typeof UpdateProductSchema>> {
    /**
     * Creates a new instance of the ProductRepository class.
     * @param client - The AxiosInstance used for making HTTP requests.
     */
    constructor(client: AxiosInstance);
}
