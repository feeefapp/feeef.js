import vine from "@vinejs/vine";
import { InferInput } from "@vinejs/vine/types";
import { AxiosInstance } from "axios";
import { OrderEntity } from "../../core/core";
import { CreateOrderSchema, SendOrderSchema } from "../validators/order";
import { ModelRepository } from "./repository";

/**
 * Represents a repository for managing orders.
 */
export class OrderRepository extends ModelRepository<
  OrderEntity,
  InferInput<typeof CreateOrderSchema>,
  InferInput<typeof CreateOrderSchema>
> {
  /**
   * Constructs a new OrderRepository instance.
   * @param client - The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super("orders", client);
  }

  /**
   * Sends an order from an anonymous user.
   * @param data - The data representing the order to be sent.
   * @returns A Promise that resolves to the sent OrderEntity.
   */
  async send(data: InferInput<typeof SendOrderSchema>): Promise<OrderEntity> {
    const validator = vine.compile(SendOrderSchema);
    const output = await validator.validate(data);
    const res = await this.client.post(`/${this.resource}/send`, output);

    // Return the sent OrderEntity
    return res.data;
  }
}
