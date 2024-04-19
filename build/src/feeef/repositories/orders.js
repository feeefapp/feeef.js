import vine from "@vinejs/vine";
import { SendOrderSchema } from "../validators/order";
import { ModelRepository } from "./repository";
/**
 * Represents a repository for managing orders.
 */
export class OrderRepository extends ModelRepository {
    /**
     * Constructs a new OrderRepository instance.
     * @param client - The AxiosInstance used for making HTTP requests.
     */
    constructor(client) {
        super("orders", client);
    }
    /**
     * Sends an order from an anonymous user.
     * @param data - The data representing the order to be sent.
     * @returns A Promise that resolves to the sent OrderEntity.
     */
    async send(data) {
        const validator = vine.compile(SendOrderSchema);
        const output = await validator.validate(data);
        const res = await this.client.post(`/${this.resource}/send`, output);
        // Return the sent OrderEntity
        return res.data;
    }
}
