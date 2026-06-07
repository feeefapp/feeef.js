import { AxiosInstance } from 'axios'
import {
  type BatchDeleteRequest,
  type BatchReleaseRequest,
  type BatchResult,
  type BatchUpdateManyRequest,
  batchReleaseBody,
  batchUpdateManyBody,
} from '../../core/batch.js'
import {
  InventoryObject,
  Project,
  InventoryMovement,
  InventoryAlias,
  InventoryWarehouse,
  InventoryReservation,
  InventoryReceiveInput,
  InventoryApplyDeltasInput,
} from '../../core/entities/inventory.js'
import { ModelRepository, ListResponse } from './repository.js'

/** Typed batch update for inventory objects (`objects.updateMany`). */
export class InventoryBatchUpdateObjectsRequest implements BatchUpdateManyRequest {
  projectId: string
  names: string[]
  updateMask: string[]
  returnPartialSuccess?: boolean
  requestId?: string
  readonly fields: Record<string, unknown>

  constructor(options: {
    projectId: string
    names: string[]
    updateMask: string[]
    storageClass?: string
    warehouseId?: string
    namespace?: string
    batch?: string
    priority?: number
    expiresAt?: string
    returnPartialSuccess?: boolean
    requestId?: string
  }) {
    this.projectId = options.projectId
    this.names = options.names
    this.updateMask = options.updateMask
    this.returnPartialSuccess = options.returnPartialSuccess
    this.requestId = options.requestId
    this.fields = {
      ...(options.storageClass !== undefined ? { storageClass: options.storageClass } : {}),
      ...(options.warehouseId !== undefined ? { warehouseId: options.warehouseId } : {}),
      ...(options.namespace !== undefined ? { namespace: options.namespace } : {}),
      ...(options.batch !== undefined ? { batch: options.batch } : {}),
      ...(options.priority !== undefined ? { priority: options.priority } : {}),
      ...(options.expiresAt !== undefined ? { expiresAt: options.expiresAt } : {}),
    }
  }
}

/** Inventory stock objects (`/inventory/objects`). */
export class InventoryObjectRepository extends ModelRepository<
  InventoryObject,
  InventoryReceiveInput,
  Record<string, unknown>
> {
  constructor(client: AxiosInstance) {
    super('inventory/objects', client)
  }

  override async find(options: {
    id: string
    params?: Record<string, unknown>
  }): Promise<InventoryObject> {
    const res = await this.client.get(`/inventory/objects/${options.id}`, {
      params: options.params,
    })
    return res.data
  }

  override async list(options?: {
    page?: number
    offset?: number
    limit?: number
    params?: Record<string, unknown>
  }): Promise<ListResponse<InventoryObject>> {
    const { page, offset, limit, params } = options ?? {}
    const res = await this.client.get('/inventory/objects', {
      params: { page, offset, limit, ...params },
    })
    return res.data
  }

  override async create(data: InventoryReceiveInput): Promise<InventoryObject> {
    const res = await this.client.post('/inventory/objects', data)
    return res.data
  }

  override async update(options: {
    id: string
    data: Record<string, unknown>
    params?: Record<string, unknown>
  }): Promise<InventoryObject> {
    const res = await this.client.put(`/inventory/objects/${options.id}`, options.data, {
      params: options.params,
    })
    return res.data
  }

  override async delete(options: { id: string; params?: Record<string, unknown> }): Promise<void> {
    await this.client.delete(`/inventory/objects/${options.id}`, { params: options.params })
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<InventoryObject>> {
    return this.postBatchDelete(request)
  }

  override async updateMany(
    request: BatchUpdateManyRequest | InventoryBatchUpdateObjectsRequest
  ): Promise<BatchResult<InventoryObject>> {
    const body =
      request instanceof InventoryBatchUpdateObjectsRequest
        ? batchUpdateManyBody(request)
        : batchUpdateManyBody(request)
    return this.postBatch(`/${this.resource}:batchUpdate`, body)
  }

  async applyDeltas(data: InventoryApplyDeltasInput): Promise<void> {
    await this.client.post('/inventory/objects/apply-deltas', data)
  }
}

export class InventoryWarehouseRepository extends ModelRepository<
  InventoryWarehouse,
  { projectId: string; name: string; code: string; namespacePrefix?: string },
  Record<string, unknown>
> {
  constructor(client: AxiosInstance) {
    super('inventory/warehouses', client)
  }

  override async list(options?: {
    params?: Record<string, unknown>
  }): Promise<ListResponse<InventoryWarehouse>> {
    const res = await this.client.get('/inventory/warehouses', { params: options?.params })
    return res.data
  }

  override async create(data: {
    projectId: string
    name: string
    code: string
    namespacePrefix?: string
  }): Promise<InventoryWarehouse> {
    const res = await this.client.post('/inventory/warehouses', data)
    return res.data
  }

  override async delete(options: { id: string; params?: Record<string, unknown> }): Promise<void> {
    await this.client.delete(`/inventory/warehouses/${options.id}`, {
      params: options.params,
    })
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<InventoryWarehouse>> {
    return this.postBatchDelete(request)
  }
}

export class InventoryAliasRepository extends ModelRepository<
  InventoryAlias,
  { projectId: string; alias: string; targetSku: string },
  { targetSku: string }
> {
  constructor(client: AxiosInstance) {
    super('inventory/aliases', client)
  }

  override async list(options?: {
    params?: Record<string, unknown>
  }): Promise<ListResponse<InventoryAlias>> {
    const res = await this.client.get('/inventory/aliases', { params: options?.params })
    return res.data
  }

  override async create(data: {
    projectId: string
    alias: string
    targetSku: string
  }): Promise<InventoryAlias> {
    const res = await this.client.post('/inventory/aliases', data)
    return res.data
  }

  override async update(options: {
    id: string
    data: { targetSku: string }
    params?: Record<string, unknown>
  }): Promise<InventoryAlias> {
    const res = await this.client.put(`/inventory/aliases/${options.id}`, options.data, {
      params: options.params,
    })
    return res.data
  }

  override async delete(options: { id: string; params?: Record<string, unknown> }): Promise<void> {
    await this.client.delete(`/inventory/aliases/${options.id}`, { params: options.params })
  }

  override async deleteMany(request: BatchDeleteRequest): Promise<BatchResult<InventoryAlias>> {
    return this.postBatchDelete(request)
  }
}

export class InventoryReservationRepository extends ModelRepository<
  InventoryReservation,
  never,
  never
> {
  constructor(client: AxiosInstance) {
    super('inventory/reservations', client)
  }

  override async find(options: {
    id: string
    params?: Record<string, unknown>
  }): Promise<InventoryReservation> {
    const res = await this.client.get(`/inventory/reservations/${options.id}`, {
      params: options.params,
    })
    const data = res.data
    if (Array.isArray(data) && data.length > 0) return data[0]
    return data
  }

  override async list(options?: {
    params?: Record<string, unknown>
  }): Promise<ListResponse<InventoryReservation>> {
    const res = await this.client.get('/inventory/reservations', {
      params: options?.params,
    })
    return res.data
  }

  override async create(): Promise<InventoryReservation> {
    throw new Error('Reservations are created by the inventory service')
  }

  override async update(): Promise<InventoryReservation> {
    throw new Error('Reservations cannot be updated; use release')
  }

  override async delete(): Promise<void> {
    throw new Error('Reservations cannot be deleted; use release')
  }

  async release(options: { projectId: string; id: string }): Promise<void> {
    await this.client.post(`/inventory/reservations/${options.id}:release`, null, {
      params: { projectId: options.projectId },
    })
  }

  async releaseMany(request: BatchReleaseRequest): Promise<BatchResult<void>> {
    return this.postBatch<void>(`/${this.resource}:batchRelease`, batchReleaseBody(request))
  }
}

export class InventoryMovementRepository extends ModelRepository<InventoryMovement, never, never> {
  constructor(client: AxiosInstance) {
    super('inventory/movements', client)
  }

  override async list(options?: {
    params?: Record<string, unknown>
  }): Promise<ListResponse<InventoryMovement>> {
    const res = await this.client.get('/inventory/movements', { params: options?.params })
    return res.data
  }

  override async create(): Promise<InventoryMovement> {
    throw new Error('Inventory movements are immutable audit records')
  }

  override async update(): Promise<InventoryMovement> {
    throw new Error('Inventory movements are immutable audit records')
  }

  override async delete(): Promise<void> {
    throw new Error('Inventory movements are immutable audit records')
  }
}

/**
 * Inventory API facade. Use sub-repositories for CRUD and batch ops.
 */
export class InventoryRepository {
  readonly objects: InventoryObjectRepository
  readonly warehouses: InventoryWarehouseRepository
  readonly aliases: InventoryAliasRepository
  readonly reservations: InventoryReservationRepository
  readonly movements: InventoryMovementRepository
  readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
    this.objects = new InventoryObjectRepository(client)
    this.warehouses = new InventoryWarehouseRepository(client)
    this.aliases = new InventoryAliasRepository(client)
    this.reservations = new InventoryReservationRepository(client)
    this.movements = new InventoryMovementRepository(client)
  }

  async availability(params: {
    projectId: string
    skus: string[]
  }): Promise<Record<string, number>> {
    const res = await this.client.get('/inventory/availability', {
      params: { projectId: params.projectId, skus: params.skus.join(',') },
    })
    const raw = res.data as { data?: Record<string, number> } | Record<string, number>
    if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
      return raw.data as Record<string, number>
    }
    return (raw as Record<string, number>) ?? {}
  }

  async reservationsByHolder(params: {
    projectId: string
    holderRef: string
  }): Promise<ListResponse<InventoryReservation>> {
    return this.reservations.list({ params })
  }

  async listProjects(): Promise<ListResponse<Project>> {
    const res = await this.client.get('/inventory/projects')
    return res.data
  }

  async createProject(data: { name: string }): Promise<Project> {
    const res = await this.client.post('/inventory/projects', data)
    return res.data
  }

  async publicAvailability(data: {
    storeId: string
    skus: string[]
  }): Promise<Record<string, number>> {
    const res = await this.client.post('/inventory/public/availability', data)
    const raw = res.data as { data?: Record<string, number> } | Record<string, number>
    if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
      return raw.data as Record<string, number>
    }
    return (raw as Record<string, number>) ?? {}
  }
}
