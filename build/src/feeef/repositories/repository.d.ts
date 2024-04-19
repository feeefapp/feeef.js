import { AxiosInstance } from "axios";
/**
 * Represents a generic model repository.
 * @template T - The type of the model.
 * @template C - The type of the create options.
 * @template U - The type of the update options.
 */
export declare abstract class ModelRepository<T, C, U> {
    resource: string;
    client: AxiosInstance;
    /**
     * Constructs a new instance of the ModelRepository class.
     * @param resource - The resource name.
     * @param client - The Axios instance used for making HTTP requests.
     */
    constructor(resource: string, client: AxiosInstance);
    /**
     * Finds a model by its ID or other criteria.
     * @param options - The options for finding the model.
     * @returns A promise that resolves to the found model.
     */
    find(options: ModelFindOptions): Promise<T>;
    /**
     * Lists models with optional pagination and filtering.
     * @param options - The options for listing the models.
     * @returns A promise that resolves to a list of models.
     */
    list(options?: ModelListOptions): Promise<ListResponse<T>>;
    /**
     * Creates a new model.
     * @param options - The options for creating the model.
     * @returns A promise that resolves to the created model.
     */
    create(options: ModelCreateOptions<C>): Promise<T>;
    /**
     * Updates an existing model.
     * @param options - The options for updating the model.
     * @returns A promise that resolves to the updated model.
     */
    update(options: ModelUpdateOptions<U>): Promise<T>;
    /**
     * Deletes a model by its ID or other criteria.
     * @param options - The options for deleting the model.
     * @returns A promise that resolves when the model is deleted.
     */
    delete(options: ModelFindOptions): Promise<void>;
}
/**
 * Represents a list response containing an array of data of type T.
 */
export interface ListResponse<T> {
    data: T[];
    total?: number;
    page?: number;
    limit?: number;
}
/**
 * Represents the options for making a request.
 */
interface RequestOptions {
    params?: Record<string, any>;
}
export interface ModelFindOptions extends RequestOptions {
    /**
     * The ID of the model to find or the value to find by.
     */
    id: string;
    /**
     * The field to find by.
     * @default "id" - The ID field.
     */
    by?: string;
}
/**
 * Options for listing models.
 */
export interface ModelListOptions extends RequestOptions {
    /**
     * The page number to retrieve.
     */
    page?: number;
    /**
     * The offset from the beginning of the list.
     */
    offset?: number;
    /**
     * The maximum number of models to retrieve per page.
     */
    limit?: number;
}
/**
 * Represents the options for creating a model.
 * @template T - The type of data being created.
 */
export interface ModelCreateOptions<T> extends RequestOptions {
    data: T;
}
/**
 * Represents the options for updating a model.
 * @template T - The type of the data being updated.
 */
export interface ModelUpdateOptions<T> extends RequestOptions {
    /**
     * The ID of the model to update.
     */
    id: string;
    /**
     * The data to update the model with.
     */
    data: T;
}
export {};
