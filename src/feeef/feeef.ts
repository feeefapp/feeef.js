import axios, { AxiosInstance } from "axios";
import vine from "@vinejs/vine";
import { CreateOrderSchema, SendOrderSchema } from "./validators/order";
import { CreateStoreSchema } from "./validators/stores";
import {
  CreateUserStoreSchema,
  UpdateUserStoreSchema,
} from "./validators/user_stores";
import { CreateProductSchema, UpdateProductSchema } from "./validators/product";
import { CreateUserSchema, UpdateUserSchema } from "./validators/users";
import { AuthUpdateUserSchema, SigninSchema } from "./validators/auth";
import { InferInput } from "@vinejs/vine/types";
import {
  ProductEntity,
  StoreEntity,
  UserEntity,
  AuthToken,
  OrderEntity,
} from "../core/core";
// import Emittery from 'emittery';

abstract class ModelRepository<T, C, U> {
  resource: string;
  // client
  client: AxiosInstance;
  // constructor
  constructor(resource: string, client: AxiosInstance) {
    this.resource = resource;
    this.client = client;
  }

  async find(options: ModelFindOptions): Promise<T> {
    const { id, by, params } = options;
    const res = await this.client.get(`/${this.resource}/${id}`, {
      params: {
        by: by || "id",
        ...params,
      },
    });
    return res.data;
  }

  async list(options: ModelListOptions): Promise<T[]> {
    const { page, offset, limit, params } = options;
    const res = await this.client.get(`/${this.resource}`, {
      params: { page, offset, limit, ...params },
    });
    return res.data;
  }

  async create(options: ModelCreateOptions<C>): Promise<T> {
    const { data, params } = options;
    const res = await this.client.post(`/${this.resource}`, data, { params });
    return res.data;
  }

  async update(options: ModelUpdateOptions<U>): Promise<T> {
    const { id, data, params } = options;
    const res = await this.client.put(`/${this.resource}/${id}`, data, {
      params,
    });
    return res.data;
  }

  async delete(options: ModelFindOptions): Promise<void> {
    const { id, by, params } = options;
    await this.client.delete(`/${this.resource}/${id}`, {
      params: {
        by: by || "id",
        ...params,
      },
    });
  }
}

// RequestOptions interface
interface RequestOptions {
  params?: Record<string, any>;
}

interface ModelFindOptions extends RequestOptions {
  id: string;
  by?: string;
}

interface ModelListOptions extends RequestOptions {
  page?: number;
  offset?: number;
  limit?: number;
}

interface ModelCreateOptions<T> extends RequestOptions {
  data: T;
}

interface ModelUpdateOptions<T> extends RequestOptions {
  id: string;
  data: T;
}

export class StoreRepository extends ModelRepository<
  StoreEntity,
  InferInput<typeof CreateUserStoreSchema>,
  InferInput<typeof UpdateUserStoreSchema>
> {
  constructor(client: AxiosInstance) {
    super("stores", client);
  }

  // add validation using vine
  async create(
    options: ModelCreateOptions<InferInput<typeof CreateStoreSchema>>
  ): Promise<StoreEntity> {
    const validator = vine.compile(CreateStoreSchema);
    const output = await validator.validate(options.data);
    return super.create({ ...options, data: output });
  }
}

export class ProductRepository extends ModelRepository<
  ProductEntity,
  InferInput<typeof CreateProductSchema>,
  InferInput<typeof UpdateProductSchema>
> {
  constructor(client: AxiosInstance) {
    super("products", client);
  }
}

export interface AuthResponse {
  token: AuthToken;
  user: UserEntity;
}

export class UserRepository extends ModelRepository<
  UserEntity,
  InferInput<typeof CreateUserSchema>,
  InferInput<typeof UpdateUserSchema>
> {
  auth: AuthResponse | null = null;

  constructor(client: AxiosInstance) {
    super("users", client);
  }

  // sign in
  async signin(
    credentials: InferInput<typeof SigninSchema>
  ): Promise<AuthResponse> {
    // validate the input
    const validator = vine.compile(SigninSchema);
    const output = await validator.validate(credentials);
    const res = await this.client.post(`/${this.resource}/auth/signin`, output);
    this.auth = res.data;
    return res.data;
  }

  // sign up
  async signup(
    credentials: InferInput<typeof CreateUserSchema>
  ): Promise<AuthResponse> {
    // validate the input
    const validator = vine.compile(CreateUserSchema);
    const output = await validator.validate(credentials);
    const res = await this.client.post(`/${this.resource}/auth/signup`, output);
    this.auth = res.data;
    return res.data;
  }

  // sign out
  async signout(): Promise<void> {
    this.auth = null;
  }

  // updateMe
  async updateMe(
    data: InferInput<typeof AuthUpdateUserSchema>
  ): Promise<UserEntity> {
    const validator = vine.compile(AuthUpdateUserSchema);
    const output = await validator.validate(data);
    const res = await this.client.put(`/${this.resource}/auth`, output);
    return res.data;
  }
}

export class OrderRepository extends ModelRepository<
  OrderEntity,
  InferInput<typeof CreateOrderSchema>,
  InferInput<typeof CreateOrderSchema>
> {
  constructor(client: AxiosInstance) {
    super("orders", client);
  }

  // send, is a function that sends the order from anonymous user
  async send(data: InferInput<typeof SendOrderSchema>): Promise<OrderEntity> {
    const validator = vine.compile(SendOrderSchema);
    const output = await validator.validate(data);
    const res = await this.client.post(`/${this.resource}/send`, output);
    return res.data;
  }
}

// singleton
export class FeeeF {
  apiKey: string;
  client: AxiosInstance;
  store: StoreRepository;
  product: ProductRepository;
  user: UserRepository;
  order: OrderRepository;

  constructor(apiKey: string, client?: AxiosInstance) {
    this.apiKey = apiKey;
    this.client = client || axios;
    this.store = new StoreRepository(this.client);
    this.product = new ProductRepository(this.client);
    this.user = new UserRepository(this.client);
    this.order = new OrderRepository(this.client);
  }
}
