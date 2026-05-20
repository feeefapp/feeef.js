import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
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

export class InventoryRepository extends ModelRepository<
  InventoryObject,
  InventoryReceiveInput,
  any
> {
  constructor(client: AxiosInstance) {
    super('inventory', client)
  }

  /**
   * List inventory objects with filtering
   */
  async listObjects(params: {
    projectId: string
    namespace?: string
    sku?: string
    page?: number
    limit?: number
  }): Promise<ListResponse<InventoryObject>> {
    const res = await this.client.get('/inventory/objects', { params })
    return res.data
  }

  /**
   * Receive stock (Stock-in)
   */
  async receive(data: InventoryReceiveInput): Promise<InventoryObject> {
    const res = await this.client.post('/inventory/objects', data)
    return res.data
  }

  /**
   * Apply manual adjustments
   */
  async applyDeltas(data: InventoryApplyDeltasInput): Promise<void> {
    await this.client.post('/inventory/objects/apply-deltas', data)
  }

  /**
   * Check SKU availability
   */
  async availability(params: {
    projectId: string
    namespace: string
    skus: string[]
  }): Promise<Record<string, number>> {
    const res = await this.client.get('/inventory/availability', {
      params: {
        ...params,
        skus: params.skus.join(','),
      },
    })
    return res.data
  }

  /**
   * List movements (audit trail)
   */
  async listMovements(params: {
    projectId: string
    objectId?: string
    correlationRef?: string
    page?: number
    limit?: number
  }): Promise<ListResponse<InventoryMovement>> {
    const res = await this.client.get('/inventory/movements', { params })
    return res.data
  }

  /**
   * @deprecated Use listMovements instead
   */
  async movements(params: {
    projectId: string
    objectId?: string
    correlationRef?: string
    page?: number
    limit?: number
  }): Promise<ListResponse<InventoryMovement>> {
    return this.listMovements(params)
  }

  /**
   * List projects
   */
  async listProjects(): Promise<ListResponse<Project>> {
    const res = await this.client.get('/inventory/projects')
    return res.data
  }

  /**
   * Create project
   */
  async createProject(data: { name: string }): Promise<Project> {
    const res = await this.client.post('/inventory/projects', data)
    return res.data
  }

  /**
   * List aliases
   */
  async listAliases(params: { projectId: string }): Promise<ListResponse<InventoryAlias>> {
    const res = await this.client.get('/inventory/aliases', { params })
    return res.data
  }

  /**
   * Create alias
   */
  async createAlias(data: {
    projectId: string
    namespace: string
    sku: string
    alias: string
  }): Promise<InventoryAlias> {
    const res = await this.client.post('/inventory/aliases', data)
    return res.data
  }

  /**
   * List warehouses
   */
  async listWarehouses(params: { projectId: string }): Promise<ListResponse<InventoryWarehouse>> {
    const res = await this.client.get('/inventory/warehouses', { params })
    return res.data
  }

  /**
   * List reservations
   */
  async listReservations(params: {
    projectId: string
    holderRef?: string
    page?: number
    limit?: number
  }): Promise<ListResponse<InventoryReservation>> {
    const res = await this.client.get('/inventory/reservations', { params })
    return res.data
  }

  /**
   * Create warehouse
   */
  async createWarehouse(data: {
    projectId: string
    name: string
    code: string
  }): Promise<InventoryWarehouse> {
    const res = await this.client.post('/inventory/warehouses', data)
    return res.data
  }

  /**
   * Public availability check for storefront
   */
  async publicAvailability(data: {
    storeId: string
    skus: string[]
  }): Promise<Record<string, number>> {
    const res = await this.client.post('/inventory/public/availability', data)
    return res.data
  }
}
