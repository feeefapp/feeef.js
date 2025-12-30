import type { AxiosInstance } from 'axios'

/**
 * Options for sending a notification
 */
export interface SendNotificationOptions {
  /**
   * Notification title (required)
   * Max 100 characters (FCM recommendation)
   */
  title: string

  /**
   * Notification body/message (required)
   * Max 4000 characters (FCM recommendation)
   */
  body: string

  /**
   * Additional data payload (optional)
   * Key-value pairs sent with the notification
   */
  data?: Record<string, string>

  /**
   * Click URL (optional)
   * URL to open when notification is clicked
   */
  clickUrl?: string

  /**
   * Sound file name (optional)
   * Default: 'default'
   */
  sound?: string

  /**
   * Filterator JSON string for advanced user filtering (optional)
   * Supports complex filtering conditions - same format as users page
   */
  filterator?: string | object

  /**
   * Other standard user filter parameters
   */
  q?: string
  page?: number
  limit?: number
}

/**
 * Response from sending notifications
 */
export interface SendNotificationResponse {
  message: string
  stats: {
    usersProcessed: number
    tokensSent: number
    tokensFailed: number
    errors?: string[]
  }
}

/**
 * Service for managing notifications
 */
export class NotificationsService {
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Send notifications to filtered users
   * Admin only - uses filterator to filter users
   * @param options - Notification options including filterator
   * @returns Promise that resolves to send statistics
   */
  async send(options: SendNotificationOptions): Promise<SendNotificationResponse> {
    const payload: Record<string, any> = {
      title: options.title,
      body: options.body,
    }

    if (options.data) {
      payload.data = options.data
    }

    if (options.clickUrl) {
      payload.clickUrl = options.clickUrl
    }

    if (options.sound) {
      payload.sound = options.sound
    }

    // Handle filterator - convert to string if object
    if (options.filterator) {
      payload.filterator =
        typeof options.filterator === 'string'
          ? options.filterator
          : JSON.stringify(options.filterator)
    }

    if (options.q) {
      payload.q = options.q
    }

    if (options.page) {
      payload.page = options.page
    }

    if (options.limit) {
      payload.limit = options.limit
    }

    const res = await this.client.post('/notifications/send', payload)
    return res.data
  }
}




