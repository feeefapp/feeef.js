import { AxiosInstance } from 'axios'
import { type BatchDeleteRequest, type BatchResult } from '../../core/batch.js'
import {
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  PurchaseOrder,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  PurchaseOrderStatus,
  PurchaseReceipt,
  CreatePurchaseReceiptInput,
} from '../../core/entities/finance.js'
import { ModelRepository, ListResponse } from './repository.js'

/** Suppliers (`/finance/suppliers`). */
export class SupplierRepository extends ModelRepository<
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput
> {
  constructor(client: AxiosInstance) {
    super('finance/suppliers', client)
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<Supplier>> {
    return this.postBatchDelete(request)
  }
}

/** Purchase orders (`/finance/purchase-orders`). */
export class PurchaseOrderRepository extends ModelRepository<
  PurchaseOrder,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput
> {
  constructor(client: AxiosInstance) {
    super('finance/purchase-orders', client)
  }

  /** Transition the PO to `sent`. */
  async send(options: { projectId: string; id: string }): Promise<PurchaseOrder> {
    const res = await this.client.post(`/${this.resource}/${options.id}:send`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  /** Transition the PO to `cancelled`. */
  async cancel(options: { projectId: string; id: string }): Promise<PurchaseOrder> {
    const res = await this.client.post(`/${this.resource}/${options.id}:cancel`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  /** Set an explicit status (state machine enforced server-side). */
  async setStatus(options: {
    projectId: string
    id: string
    status: PurchaseOrderStatus
  }): Promise<PurchaseOrder> {
    const res = await this.client.post(
      `/${this.resource}/${options.id}:status`,
      { status: options.status },
      { params: { projectId: options.projectId } }
    )
    return res.data
  }
}

/** Purchase receipts (`/finance/purchase-receipts`). */
export class PurchaseReceiptRepository extends ModelRepository<
  PurchaseReceipt,
  CreatePurchaseReceiptInput,
  never
> {
  constructor(client: AxiosInstance) {
    super('finance/purchase-receipts', client)
  }

  override async update(): Promise<PurchaseReceipt> {
    throw new Error('Purchase receipts are immutable; create a new one or void/post.')
  }

  /** Post the receipt: stock goods into inventory at batch cost (idempotent). */
  async post(options: { projectId: string; id: string }): Promise<PurchaseReceipt> {
    const res = await this.client.post(`/${this.resource}/${options.id}:post`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  /** Void a posted receipt: reverse its stock-in. */
  async void(options: { projectId: string; id: string }): Promise<PurchaseReceipt> {
    const res = await this.client.post(`/${this.resource}/${options.id}:void`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }
}

/**
 * Finance API facade (Phase 1). Use sub-repositories for CRUD and document ops.
 */
export class FinanceRepository {
  readonly suppliers: SupplierRepository
  readonly purchaseOrders: PurchaseOrderRepository
  readonly purchaseReceipts: PurchaseReceiptRepository
  readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
    this.suppliers = new SupplierRepository(client)
    this.purchaseOrders = new PurchaseOrderRepository(client)
    this.purchaseReceipts = new PurchaseReceiptRepository(client)
  }

  listSuppliers(options?: {
    projectId: string
    page?: number
    limit?: number
    params?: Record<string, unknown>
  }): Promise<ListResponse<Supplier>> {
    const { projectId, page, limit, params } = options ?? ({} as any)
    return this.suppliers.list({ page, limit, params: { projectId, ...params } })
  }
}
