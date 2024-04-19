/**
 * Represents a generic model repository.
 * @template T - The type of the model.
 * @template C - The type of the create options.
 * @template U - The type of the update options.
 */
export class ModelRepository {
    resource;
    // client
    client;
    /**
     * Constructs a new instance of the ModelRepository class.
     * @param resource - The resource name.
     * @param client - The Axios instance used for making HTTP requests.
     */
    constructor(resource, client) {
        this.resource = resource;
        this.client = client;
    }
    /**
     * Finds a model by its ID or other criteria.
     * @param options - The options for finding the model.
     * @returns A promise that resolves to the found model.
     */
    async find(options) {
        const { id, by, params } = options;
        const res = await this.client.get(`/${this.resource}/${id}`, {
            params: {
                by: by || "id",
                ...params,
            },
        });
        return res.data;
    }
    /**
     * Lists models with optional pagination and filtering.
     * @param options - The options for listing the models.
     * @returns A promise that resolves to a list of models.
     */
    async list(options) {
        const { page, offset, limit, params } = options || {};
        const res = await this.client.get(`/${this.resource}`, {
            params: { page, offset, limit, ...params },
        });
        // if res.data is an array then create ListResponse
        if (Array.isArray(res.data)) {
            return {
                data: res.data,
            };
        }
        else {
            return {
                data: res.data.data,
                total: res.data.meta.total,
                page: res.data.meta.currentPage,
                limit: res.data.meta.perPage,
            };
        }
    }
    /**
     * Creates a new model.
     * @param options - The options for creating the model.
     * @returns A promise that resolves to the created model.
     */
    async create(options) {
        const { data, params } = options;
        const res = await this.client.post(`/${this.resource}`, data, { params });
        return res.data;
    }
    /**
     * Updates an existing model.
     * @param options - The options for updating the model.
     * @returns A promise that resolves to the updated model.
     */
    async update(options) {
        const { id, data, params } = options;
        const res = await this.client.put(`/${this.resource}/${id}`, data, {
            params,
        });
        return res.data;
    }
    /**
     * Deletes a model by its ID or other criteria.
     * @param options - The options for deleting the model.
     * @returns A promise that resolves when the model is deleted.
     */
    async delete(options) {
        const { id, by, params } = options;
        await this.client.delete(`/${this.resource}/${id}`, {
            params: {
                by: by || "id",
                ...params,
            },
        });
    }
}
