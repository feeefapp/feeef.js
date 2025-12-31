import { AxiosInstance } from 'axios'

// ============================================================================
// Common Types
// ============================================================================

/**
 * Delivery fees structure - Array of [home, desk] prices per state
 */
export type DeliveryFees = (number | null)[][]

// ============================================================================
// Ecotrack Integration
// ============================================================================

/**
 * Ecotrack delivery integration configuration
 */
export interface EcotrackDeliveryIntegration {
  baseUrl: string
  token: string
  active?: boolean
  metadata?: Record<string, any>
}

/**
 * Ecotrack finance data
 */
export interface EcotrackFinanceData {
  success: boolean
  amountsNotEncaissed: number
  feesNotEncaissed: number
  notEncaissed: number
  amountsEncaissed: number
  feesEncaissed: number
  encaissed: number
  amountsPaymentReady: number
  feesPaymentReady: number
  paymentReady: number
}

/**
 * Ecotrack wilaya (state) statistics
 */
export interface EcotrackWilayaData {
  wilayaId: number
  total: number
  retours: number
  livred: number
  wilayaName: string
}

/**
 * Ecotrack today's activity
 */
export interface EcotrackTodayActivity {
  expedie: number
  delivered: number
  returned: number
  suspended: number
}

/**
 * Ecotrack global statistics
 */
export interface EcotrackGlobalStats {
  enTraitement: number
  livred: number
  retours: number
  total: number
}

/**
 * Ecotrack statistics data
 */
export interface EcotrackStatisticsData {
  topWilaya: EcotrackWilayaData[]
  todayActivity: EcotrackTodayActivity
  globalStats: EcotrackGlobalStats
}

/**
 * Ecotrack sync result
 */
export interface EcotrackSyncResult {
  success: boolean
  message: string
  syncId?: string
  totalFetched?: number
  totalUpdated?: number
  totalSkipped?: number
  syncedAt?: string
  errors?: string[]
}

/**
 * Ecotrack sync status
 */
export interface EcotrackSyncStatus {
  canSync: boolean
  lastSyncAt?: string
  nextSyncAvailableAt?: string
  minutesUntilNextSync?: number
}

/**
 * Ecotrack Delivery Integration API
 */
export class EcotrackDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: EcotrackDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: EcotrackDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Ecotrack
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/ecotrack/fees`, {
      params: {
        baseUrl: this.integration.baseUrl,
        token: this.integration.token,
      },
    })
    return res.data
  }

  /**
   * Gets financial data from Ecotrack
   */
  async getFinancialData(options?: {
    limit?: number
    search?: string
    telephone?: string
  }): Promise<EcotrackFinanceData> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/ecotrack/finance`, {
      params: {
        api_token: this.integration.token,
        ...options,
      },
    })
    return {
      success: res.data.success ?? false,
      amountsNotEncaissed: res.data.amounts_not_encaissed ?? 0,
      feesNotEncaissed: res.data.fees_not_encaissed ?? 0,
      notEncaissed: res.data.not_encaissed ?? 0,
      amountsEncaissed: res.data.amounts_encaissed ?? 0,
      feesEncaissed: res.data.fees_encaissed ?? 0,
      encaissed: res.data.encaissed ?? 0,
      amountsPaymentReady: res.data.amounts_payment_ready ?? 0,
      feesPaymentReady: res.data.fees_payment_ready ?? 0,
      paymentReady: res.data.payment_ready ?? 0,
    }
  }

  /**
   * Gets statistics data from Ecotrack
   */
  async getStatistics(): Promise<EcotrackStatisticsData> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/ecotrack/statistics`)
    return {
      topWilaya: (res.data.top_wilaya || []).map((w: any) => ({
        wilayaId: w.wilaya_id ?? 0,
        total: w.total ?? 0,
        retours: w.retours ?? 0,
        livred: w.livred ?? 0,
        wilayaName: w.wilaya_name ?? '',
      })),
      todayActivity: {
        expedie: res.data.today_act?.expedie ?? 0,
        delivered: res.data.today_act?.delivered ?? 0,
        returned: res.data.today_act?.returned ?? 0,
        suspended: res.data.today_act?.suspended ?? 0,
      },
      globalStats: {
        enTraitement: res.data.global?.enTraitement ?? 0,
        livred: res.data.global?.livred ?? 0,
        retours: res.data.global?.retours ?? 0,
        total: res.data.global?.total ?? 0,
      },
    }
  }

  /**
   * Gets the sync status for this store's Ecotrack integration
   */
  async getSyncStatus(): Promise<EcotrackSyncStatus> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/ecotrack/sync/status`)
    return res.data
  }

  /**
   * Triggers a sync of orders from Ecotrack
   */
  async triggerSync(options?: {
    startDate?: Date | string
    endDate?: Date | string
  }): Promise<EcotrackSyncResult> {
    const res = await this.client.post(`/stores/${this.storeId}/integrations/ecotrack/sync`, {
      startDate:
        options?.startDate instanceof Date ? options.startDate.toISOString() : options?.startDate,
      endDate: options?.endDate instanceof Date ? options.endDate.toISOString() : options?.endDate,
    })
    return res.data
  }
}

// ============================================================================
// Yalidine Integration
// ============================================================================

/**
 * Yalidine agent type
 */
export enum YalidineAgent {
  yalidine = 'yalidine',
  guepex = 'guepex',
}

/**
 * Yalidine delivery integration configuration
 */
export interface YalidineDeliveryIntegration {
  id: string
  token: string
  agent?: YalidineAgent
  active?: boolean
  metadata?: Record<string, any>
}

/**
 * Yalidine Delivery Integration API
 */
export class YalidineDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: YalidineDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: YalidineDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Yalidine
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/yalidine/fees`, {
      params: {
        id: this.integration.id,
        token: this.integration.token,
      },
    })
    return res.data
  }
}

// ============================================================================
// Procolis Integration
// ============================================================================

/**
 * Procolis delivery integration configuration
 */
export interface ProcolisDeliveryIntegration {
  key: string
  token: string
  active?: boolean
  metadata?: Record<string, any>
}

/**
 * Procolis Delivery Integration API
 */
export class ProcolisDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: ProcolisDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: ProcolisDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Procolis
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/procolis/fees`, {
      params: {
        key: this.integration.key,
        token: this.integration.token,
      },
    })
    return res.data
  }

  /**
   * Sends an order to Procolis
   */
  async send(orderId: string): Promise<void> {
    await this.client.post(`/stores/${this.storeId}/integrations/procolis/send`, {
      key: this.integration.key,
      token: this.integration.token,
      orderId,
    })
  }
}

// ============================================================================
// Noest Integration
// ============================================================================

/**
 * Noest delivery integration configuration
 */
export interface NoestDeliveryIntegration {
  guid: string
  token: string
  active?: boolean
  metadata?: Record<string, any>
}

/**
 * Noest Delivery Integration API
 */
export class NoestDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: NoestDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: NoestDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Noest
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/noest/fees`, {
      params: {
        guid: this.integration.guid,
        token: this.integration.token,
      },
    })
    return res.data
  }

  /**
   * Sends an order to Noest
   */
  async send(orderId: string): Promise<void> {
    await this.client.post(`/stores/${this.storeId}/integrations/noest/send`, {
      guid: this.integration.guid,
      token: this.integration.token,
      orderId,
    })
  }
}

// ============================================================================
// Google Sheets Integration
// ============================================================================

/**
 * Google Sheets integration configuration for API calls
 * (Note: For store integrations, use GoogleSheetsIntegration from store.ts)
 */
export interface GoogleSheetsIntegrationConfig {
  id: string
  name: string
  active?: boolean
  oauth2?: Record<string, any>
  metadata?: Record<string, any>
  simple?: boolean
  columns?: Array<{
    field: string
    name: string
    enabled: boolean
    defaultValue?: any
  }>
}

/**
 * Google Sheets Integration API
 */
export class GoogleSheetIntegrationApi {
  private client: AxiosInstance
  private integration: GoogleSheetsIntegrationConfig
  private storeId: string

  constructor(client: AxiosInstance, integration: GoogleSheetsIntegrationConfig, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Appends a row to the Google Sheet
   */
  async appendRow(values: string[]): Promise<void> {
    await this.client.post(`/stores/${this.storeId}/integrations/google-sheets/append-row`, {
      id: this.integration.id,
      name: this.integration.name,
      row: values,
    })
  }

  /**
   * Creates a new spreadsheet
   */
  async createSpreadsheet(name: string): Promise<void> {
    await this.client.post(
      `/stores/${this.storeId}/integrations/google-sheets/create-spreadsheet`,
      { name }
    )
  }
}

// ============================================================================
// Zimou Integration
// ============================================================================

/**
 * Zimou delivery integration configuration
 */
export interface ZimouDeliveryIntegration {
  id: string
  apiKey: string
  active?: boolean
  silentMode?: boolean
  autoSend?: boolean
  metadata?: Record<string, any>
}

/**
 * Zimou Delivery Integration API
 */
export class ZimouDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: ZimouDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: ZimouDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Zimou
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/zimou/fees`, {
      params: {
        apiKey: this.integration.apiKey,
      },
    })
    return res.data
  }

  /**
   * Sends an order to Zimou
   */
  async send(orderId: string): Promise<void> {
    await this.client.post(`/stores/${this.storeId}/integrations/zimou/send`, {
      apiKey: this.integration.apiKey,
      orderId,
    })
  }
}

// ============================================================================
// Ecomanager Integration
// ============================================================================

/**
 * Ecomanager delivery integration configuration
 */
export interface EcomanagerDeliveryIntegration {
  baseUrl: string
  token: string
  active?: boolean
  autoSend?: boolean
  metadata?: Record<string, any>
}

/**
 * Ecomanager Delivery Integration API
 */
export class EcomanagerDeliveryIntegrationApi {
  private client: AxiosInstance
  private integration: EcomanagerDeliveryIntegration
  private storeId: string

  constructor(client: AxiosInstance, integration: EcomanagerDeliveryIntegration, storeId: string) {
    this.client = client
    this.integration = integration
    this.storeId = storeId
  }

  /**
   * Gets delivery fees from Ecomanager
   */
  async getDeliveryFees(): Promise<DeliveryFees> {
    const res = await this.client.get(`/stores/${this.storeId}/integrations/ecomanager/fees`, {
      params: {
        baseUrl: this.integration.baseUrl,
        token: this.integration.token,
      },
    })
    return res.data
  }

  /**
   * Sends an order to Ecomanager
   */
  async send(orderId: string): Promise<void> {
    await this.client.post(`/stores/${this.storeId}/integrations/ecomanager/send`, {
      baseUrl: this.integration.baseUrl,
      token: this.integration.token,
      orderId,
    })
  }
}

// ============================================================================
// Integration Factory
// ============================================================================

/**
 * Factory for creating integration API instances
 */
export class IntegrationFactory {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Creates an Ecotrack integration API
   */
  ecotrack(
    integration: EcotrackDeliveryIntegration,
    storeId: string
  ): EcotrackDeliveryIntegrationApi {
    return new EcotrackDeliveryIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates a Yalidine integration API
   */
  yalidine(
    integration: YalidineDeliveryIntegration,
    storeId: string
  ): YalidineDeliveryIntegrationApi {
    return new YalidineDeliveryIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates a Procolis integration API
   */
  procolis(
    integration: ProcolisDeliveryIntegration,
    storeId: string
  ): ProcolisDeliveryIntegrationApi {
    return new ProcolisDeliveryIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates a Noest integration API
   */
  noest(integration: NoestDeliveryIntegration, storeId: string): NoestDeliveryIntegrationApi {
    return new NoestDeliveryIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates a Google Sheets integration API
   */
  googleSheets(
    integration: GoogleSheetsIntegrationConfig,
    storeId: string
  ): GoogleSheetIntegrationApi {
    return new GoogleSheetIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates a Zimou integration API
   */
  zimou(integration: ZimouDeliveryIntegration, storeId: string): ZimouDeliveryIntegrationApi {
    return new ZimouDeliveryIntegrationApi(this.client, integration, storeId)
  }

  /**
   * Creates an Ecomanager integration API
   */
  ecomanager(
    integration: EcomanagerDeliveryIntegration,
    storeId: string
  ): EcomanagerDeliveryIntegrationApi {
    return new EcomanagerDeliveryIntegrationApi(this.client, integration, storeId)
  }
}
