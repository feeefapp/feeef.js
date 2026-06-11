/**
 * Finance module entities (Phase 1: procurement). Project-scoped, mirroring the
 * backend Lucid models. Money values are returned as numbers (decimal(14,2)).
 */

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
export type PurchaseReceiptStatus = 'draft' | 'posted' | 'voided'

export interface Supplier {
  id: string
  projectId: string
  name: string
  code?: string | null
  phone?: string | null
  email?: string | null
  taxId?: string | null
  address?: Record<string, any> | null
  paymentTerms?: string | null
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateSupplierInput {
  projectId: string
  name: string
  code?: string
  phone?: string
  email?: string
  taxId?: string
  address?: Record<string, any>
  paymentTerms?: string
  metadata?: Record<string, any>
}

export interface UpdateSupplierInput {
  name?: string
  code?: string | null
  phone?: string | null
  email?: string | null
  taxId?: string | null
  address?: Record<string, any> | null
  paymentTerms?: string | null
  metadata?: Record<string, any>
}

export interface PurchaseOrderItem {
  sku: string
  productId?: string | null
  variantPath?: string
  qtyOrdered: number
  qtyReceived?: number
  unitCost: number
  warehouseId?: string | null
  batch?: string | null
}

export interface PurchaseOrder {
  id: string
  projectId: string
  supplierId: string
  status: PurchaseOrderStatus
  reference?: string | null
  expectedAt?: string | null
  notes?: string | null
  items: PurchaseOrderItem[]
  currency?: string | null
  subtotal: number
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseOrderInput {
  projectId: string
  supplierId: string
  reference?: string
  expectedAt?: string
  notes?: string
  items?: PurchaseOrderItem[]
  currency?: string
}

export interface UpdatePurchaseOrderInput {
  reference?: string | null
  expectedAt?: string | null
  notes?: string | null
  items?: PurchaseOrderItem[]
  currency?: string | null
}

export interface PurchaseReceiptLine {
  id: string
  purchaseReceiptId: string
  lineNo: number
  sku: string
  productId?: string | null
  variantPath: string
  batch: string
  inventoryObjectId?: string | null
  qtyReceived: number
  unitCost: number
  lineTotal: number
  poLineIndex?: number | null
  createdAt: string
}

export interface PurchaseReceipt {
  id: string
  projectId: string
  supplierId: string
  purchaseOrderId?: string | null
  warehouseId?: string | null
  status: PurchaseReceiptStatus
  reference?: string | null
  receivedAt: string
  postedAt?: string | null
  voidedAt?: string | null
  notes?: string | null
  totalCost: number
  isPosted?: boolean
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
  lines?: PurchaseReceiptLine[]
}

export interface PurchaseReceiptLineInput {
  sku: string
  productId?: string | null
  variantPath?: string
  batch?: string | null
  qtyReceived: number
  unitCost: number
  poLineIndex?: number | null
}

export interface CreatePurchaseReceiptInput {
  projectId: string
  supplierId: string
  purchaseOrderId?: string | null
  warehouseId?: string | null
  reference?: string
  receivedAt?: string
  notes?: string
  lines: PurchaseReceiptLineInput[]
}

// --- Phase 2: payables, receivables, cash, expenses -----------------------

export type FinancialAccountType = 'cash' | 'bank' | 'ewallet'
export type SupplierBillStatus = 'draft' | 'open' | 'partial' | 'paid' | 'void'
export type ExpenseStatus = 'draft' | 'recorded' | 'voided'

export interface FinancialAccount {
  id: string
  projectId: string
  name: string
  type: FinancialAccountType
  currency?: string | null
  openingBalance: number
  isDefault: boolean
  metadata?: Record<string, any>
  /** Present on `show` (derived). */
  balance?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateFinancialAccountInput {
  projectId: string
  name: string
  type?: FinancialAccountType
  currency?: string
  openingBalance?: number
  isDefault?: boolean
  metadata?: Record<string, any>
}

export interface UpdateFinancialAccountInput {
  name?: string
  type?: FinancialAccountType
  currency?: string | null
  openingBalance?: number
  isDefault?: boolean
  metadata?: Record<string, any>
}

export interface SupplierBill {
  id: string
  projectId: string
  supplierId: string
  purchaseReceiptId?: string | null
  reference?: string | null
  billDate: string
  dueDate?: string | null
  currency?: string | null
  totalAmount: number
  paidAmount: number
  balanceDue?: number
  status: SupplierBillStatus
  notes?: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
  payments?: SupplierPayment[]
}

export interface CreateSupplierBillInput {
  projectId: string
  supplierId: string
  purchaseReceiptId?: string | null
  reference?: string
  billDate: string
  dueDate?: string | null
  currency?: string
  totalAmount: number
  notes?: string
}

export interface SupplierPayment {
  id: string
  projectId: string
  supplierBillId: string
  financialAccountId: string
  amount: number
  paidAt: string
  method?: string | null
  reference?: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaySupplierBillInput {
  projectId: string
  financialAccountId: string
  amount: number
  paidAt?: string | null
  method?: string | null
  reference?: string | null
  allowOverpay?: boolean
}

export interface CustomerPayment {
  id: string
  projectId: string
  orderId: string
  financialAccountId: string
  amount: number
  receivedAt: string
  method?: string | null
  reference?: string | null
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
}

export interface CollectCustomerPaymentInput {
  projectId: string
  financialAccountId: string
  amount: number
  receivedAt?: string | null
  method?: string | null
  reference?: string | null
  allowOverpay?: boolean
}

export interface Receivable {
  orderId: string
  storeId: string
  total: number
  paid: number
  balanceDue: number
  status: string
  deliveryStatus: string
  codInTransit: boolean
}

export interface ExpenseCategory {
  id: string
  projectId: string
  name: string
  parentId?: string | null
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateExpenseCategoryInput {
  projectId: string
  name: string
  parentId?: string | null
  metadata?: Record<string, any>
}

export interface UpdateExpenseCategoryInput {
  name?: string
  parentId?: string | null
  metadata?: Record<string, any>
}

export interface Expense {
  id: string
  projectId: string
  categoryId?: string | null
  supplierId?: string | null
  financialAccountId?: string | null
  amount: number
  currency?: string | null
  spentAt: string
  paymentMethod?: string | null
  status: ExpenseStatus
  reference?: string | null
  note?: string | null
  attachments: any[]
  createdByUserId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateExpenseInput {
  projectId: string
  categoryId?: string | null
  supplierId?: string | null
  financialAccountId?: string | null
  amount: number
  currency?: string
  spentAt: string
  paymentMethod?: string | null
  status?: ExpenseStatus
  reference?: string | null
  note?: string | null
  attachments?: any[]
}

export interface UpdateExpenseInput {
  categoryId?: string | null
  supplierId?: string | null
  financialAccountId?: string | null
  amount?: number
  currency?: string | null
  spentAt?: string
  paymentMethod?: string | null
  status?: ExpenseStatus
  reference?: string | null
  note?: string | null
  attachments?: any[]
}

// --- Phase 2: reports -----------------------------------------------------

export interface FinanceOverview {
  cash: number
  inventoryValuation: number
  accountsReceivable: number
  accountsPayable: number
  netPosition: number
}

export interface AgingResult {
  buckets: { label: string; amount: number }[]
  total: number
}

export interface CashPosition {
  accounts: {
    id: string
    name: string
    type: FinancialAccountType
    currency?: string | null
    balance: number
  }[]
  total: number
}

export interface PnlReport {
  from: string | null
  to: string | null
  revenue: number
  cogs: number
  grossProfit: number
  expenses: number
  netProfit: number
}
