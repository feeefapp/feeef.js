// entities
export * from "./entities/order";
export * from "./entities/store";
export * from "./entities/product";
export * from "./entities/user";
export * from "./entities/shipping_method";
// embaddeds
export * from "./embadded/address";
export * from "./embadded/category";
export * from "./embadded/contact";


export enum OrderStatus {
  draft = 'draft',
  pending = 'pending',
  processing = 'processing',
  completed = 'completed',
  cancelled = 'cancelled',
}

// PaymentStatus
export enum PaymentStatus {
  unpaid = 'unpaid',
  paid = 'paid',
  received = 'received',
}
export enum DeliveryStatus {
  pending = 'pending',
  delivering = 'delivering',
  delivered = 'delivered',
  returned = 'returned',
}