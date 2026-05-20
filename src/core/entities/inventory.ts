export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface InventoryWarehouse {
  id: string
  projectId: string
  name: string
  code: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface InventoryObject {
  id: string
  projectId: string
  namespace: string
  sku: string
  batch: string
  warehouseId?: string
  storageClass: string
  key: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  receivedAt: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface InventoryMovement {
  id: string
  projectId: string
  objectId: string
  type: 'in' | 'out' | 'adjust' | 'reserve' | 'release' | 'consume'
  quantityDelta: number
  balanceAfter: number
  reason?: string
  correlationRef?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface InventoryReservation {
  id: string
  projectId: string
  holderRef: string
  metadata?: Record<string, any>
  createdAt: string
  expiresAt?: string
}

export interface InventoryAlias {
  id: string
  projectId: string
  namespace: string
  sku: string
  alias: string
  createdAt: string
}

export interface InventoryReceiveInput {
  projectId: string
  namespace: string
  sku: string
  batch?: string
  quantity: number
  warehouseId?: string
  storageClass?: string
  metadata?: Record<string, any>
}

export interface InventoryDeltaInput {
  objectId: string
  quantityDelta: number
}

export interface InventoryApplyDeltasInput {
  projectId: string
  deltas: InventoryDeltaInput[]
  reason: string
  correlationRef?: string
}
