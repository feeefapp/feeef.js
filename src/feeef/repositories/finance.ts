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
  FinancialAccount,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
  SupplierBill,
  CreateSupplierBillInput,
  PaySupplierBillInput,
  SupplierPayment,
  CustomerPayment,
  CollectCustomerPaymentInput,
  Receivable,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseCategory,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
  FinanceOverview,
  AgingResult,
  CashPosition,
  PnlReport,
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
    const res = await this.client.post(`/${this.resource}/${options.id}/send`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  /** Transition the PO to `cancelled`. */
  async cancel(options: { projectId: string; id: string }): Promise<PurchaseOrder> {
    const res = await this.client.post(`/${this.resource}/${options.id}/cancel`, null, {
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
      `/${this.resource}/${options.id}/status`,
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
    const res = await this.client.post(`/${this.resource}/${options.id}/post`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  /** Void a posted receipt: reverse its stock-in. */
  async void(options: { projectId: string; id: string }): Promise<PurchaseReceipt> {
    const res = await this.client.post(`/${this.resource}/${options.id}/void`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }
}

/** Financial accounts — cash / bank / e-wallet (`/finance/financial-accounts`). */
export class FinancialAccountRepository extends ModelRepository<
  FinancialAccount,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput
> {
  constructor(client: AxiosInstance) {
    super('finance/financial-accounts', client)
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<FinancialAccount>> {
    return this.postBatchDelete(request)
  }
}

/** Supplier bills — Accounts Payable (`/finance/supplier-bills`). */
export class SupplierBillRepository extends ModelRepository<
  SupplierBill,
  CreateSupplierBillInput,
  never
> {
  constructor(client: AxiosInstance) {
    super('finance/supplier-bills', client)
  }

  override async update(): Promise<SupplierBill> {
    throw new Error('Supplier bills are managed via payments; bill totals are not edited.')
  }

  /** Record a (partial) payment against a bill. */
  async pay(options: { id: string } & PaySupplierBillInput): Promise<{
    bill: SupplierBill
    payment: SupplierPayment
  }> {
    const { id, projectId, ...body } = options
    const res = await this.client.post(
      `/${this.resource}/${id}/pay`,
      { projectId, ...body },
      { params: { projectId } }
    )
    return res.data
  }
}

/** Supplier payments (`/finance/supplier-payments`). */
export class SupplierPaymentRepository extends ModelRepository<SupplierPayment, never, never> {
  constructor(client: AxiosInstance) {
    super('finance/supplier-payments', client)
  }

  /** Void a payment and recompute the parent bill. */
  async void(options: { projectId: string; id: string }): Promise<SupplierBill> {
    const res = await this.client.post(`/${this.resource}/${options.id}/void`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }
}

/** Customer payments — Accounts Receivable collection (`/finance/customer-payments`). */
export class CustomerPaymentRepository extends ModelRepository<CustomerPayment, never, never> {
  constructor(client: AxiosInstance) {
    super('finance/customer-payments', client)
  }

  /** Void a customer payment. */
  async void(options: { projectId: string; id: string }): Promise<{ success: boolean }> {
    const res = await this.client.post(`/${this.resource}/${options.id}/void`, null, {
      params: { projectId: options.projectId },
    })
    return res.data
  }
}

/** Expenses (`/finance/expenses`). */
export class ExpenseRepository extends ModelRepository<
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput
> {
  constructor(client: AxiosInstance) {
    super('finance/expenses', client)
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<Expense>> {
    return this.postBatchDelete(request)
  }
}

/** Expense categories (`/finance/expense-categories`). */
export class ExpenseCategoryRepository extends ModelRepository<
  ExpenseCategory,
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput
> {
  constructor(client: AxiosInstance) {
    super('finance/expense-categories', client)
  }
}

/**
 * Finance API facade. Use sub-repositories for CRUD and document ops; top-level
 * helpers cover AR collection and reports.
 */
export class FinanceRepository {
  readonly suppliers: SupplierRepository
  readonly purchaseOrders: PurchaseOrderRepository
  readonly purchaseReceipts: PurchaseReceiptRepository
  readonly financialAccounts: FinancialAccountRepository
  readonly supplierBills: SupplierBillRepository
  readonly supplierPayments: SupplierPaymentRepository
  readonly customerPayments: CustomerPaymentRepository
  readonly expenses: ExpenseRepository
  readonly expenseCategories: ExpenseCategoryRepository
  readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
    this.suppliers = new SupplierRepository(client)
    this.purchaseOrders = new PurchaseOrderRepository(client)
    this.purchaseReceipts = new PurchaseReceiptRepository(client)
    this.financialAccounts = new FinancialAccountRepository(client)
    this.supplierBills = new SupplierBillRepository(client)
    this.supplierPayments = new SupplierPaymentRepository(client)
    this.customerPayments = new CustomerPaymentRepository(client)
    this.expenses = new ExpenseRepository(client)
    this.expenseCategories = new ExpenseCategoryRepository(client)
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

  /** Open order receivables (derived, read-only). */
  async listReceivables(options: { projectId: string }): Promise<Receivable[]> {
    const res = await this.client.get('/finance/receivables', {
      params: { projectId: options.projectId },
    })
    return res.data.data ?? res.data
  }

  /** Record a customer / COD payment against an order. */
  async collectPayment(
    options: { orderId: string } & CollectCustomerPaymentInput
  ): Promise<CustomerPayment> {
    const { orderId, projectId, ...body } = options
    const res = await this.client.post(
      `/finance/orders/${orderId}/collect`,
      { projectId, ...body },
      { params: { projectId } }
    )
    return res.data
  }

  // --- Reports ------------------------------------------------------------

  async overview(options: { projectId: string }): Promise<FinanceOverview> {
    const res = await this.client.get('/finance/reports/overview', {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  async cashPosition(options: { projectId: string }): Promise<CashPosition> {
    const res = await this.client.get('/finance/reports/cash-position', {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  async apAging(options: { projectId: string }): Promise<AgingResult> {
    const res = await this.client.get('/finance/reports/ap-aging', {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  async arAging(options: { projectId: string }): Promise<AgingResult> {
    const res = await this.client.get('/finance/reports/ar-aging', {
      params: { projectId: options.projectId },
    })
    return res.data
  }

  async pnl(options: { projectId: string; from?: string; to?: string }): Promise<PnlReport> {
    const res = await this.client.get('/finance/reports/pnl', {
      params: { projectId: options.projectId, from: options.from, to: options.to },
    })
    return res.data
  }

  // --- Phase 3 GL ---------------------------------------------------------

  async listGlAccounts(options: { projectId: string; type?: string }) {
    const res = await this.client.get('/finance/gl-accounts', {
      params: { projectId: options.projectId, type: options.type },
    })
    return res.data?.data ?? res.data
  }

  async listJournalEntries(options: {
    projectId: string
    status?: string
    from?: string
    to?: string
  }) {
    const res = await this.client.get('/finance/journal-entries', {
      params: options,
    })
    return res.data?.data ?? res.data
  }

  async trialBalance(options: { projectId: string; asOf?: string }) {
    const res = await this.client.get('/finance/reports/trial-balance', {
      params: { projectId: options.projectId, asOf: options.asOf },
    })
    return res.data
  }

  async balanceSheet(options: { projectId: string; asOf?: string }) {
    const res = await this.client.get('/finance/reports/balance-sheet', {
      params: { projectId: options.projectId, asOf: options.asOf },
    })
    return res.data
  }
}
