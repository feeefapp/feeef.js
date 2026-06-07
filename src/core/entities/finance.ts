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
