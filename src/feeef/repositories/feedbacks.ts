import { AxiosInstance } from 'axios'
import { ModelRepository, ListResponse } from './repository.js'
import {
  FeedbackEntity,
  FeedbackCreateInput,
  FeedbackUpdateInput,
  FeedbackListOptions,
} from '../../core/entities/feedback.js'

/**
 * Repository for managing Feedback entities.
 */
export class FeedbackRepository extends ModelRepository<
  FeedbackEntity,
  FeedbackCreateInput,
  FeedbackUpdateInput
> {
  /**
   * Constructs a new FeedbackRepository instance.
   * @param client The AxiosInstance used for making HTTP requests.
   */
  constructor(client: AxiosInstance) {
    super('feedbacks', client)
  }

  /**
   * Lists feedbacks with optional filtering.
   * @param options - The options for listing feedbacks.
   * @returns A Promise that resolves to a list of Feedback entities.
   */
  async list(options?: FeedbackListOptions): Promise<ListResponse<FeedbackEntity>> {
    const params: Record<string, any> = {}

    if (options) {
      if (options.page) params.page = options.page
      if (options.offset) params.offset = options.offset
      if (options.limit) params.limit = options.limit
      if (options.status) params.status = options.status
      if (options.priority) params.priority = options.priority
      if (options.tags) params.tags = options.tags
      if (options.q) params.q = options.q
      if (options.createdAfter) {
        params.created_after =
          options.createdAfter instanceof Date
            ? options.createdAfter.toISOString()
            : options.createdAfter
      }
      if (options.createdBefore) {
        params.created_before =
          options.createdBefore instanceof Date
            ? options.createdBefore.toISOString()
            : options.createdBefore
      }
      if (options.updatedAfter) {
        params.updated_after =
          options.updatedAfter instanceof Date
            ? options.updatedAfter.toISOString()
            : options.updatedAfter
      }
      if (options.updatedBefore) {
        params.updated_before =
          options.updatedBefore instanceof Date
            ? options.updatedBefore.toISOString()
            : options.updatedBefore
      }
      if (options.resolvedAfter) {
        params.resolved_after =
          options.resolvedAfter instanceof Date
            ? options.resolvedAfter.toISOString()
            : options.resolvedAfter
      }
      if (options.resolvedBefore) {
        params.resolved_before =
          options.resolvedBefore instanceof Date
            ? options.resolvedBefore.toISOString()
            : options.resolvedBefore
      }
      if (options.resolved !== undefined) params.resolved = options.resolved
    }

    return super.list({ params })
  }

  /**
   * Adds a comment to existing feedback.
   * @param id - The feedback ID.
   * @param comment - The comment to add.
   * @returns A Promise that resolves to the updated Feedback entity.
   */
  async addComment(id: string, comment: string): Promise<FeedbackEntity> {
    const res = await this.client.post(`/${this.resource}/${id}/comments`, { comment })
    return res.data
  }

  /**
   * Creates feedback with file attachments.
   * @param data - The feedback data.
   * @param files - Optional array of files to attach.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the created Feedback entity.
   */
  async createWithFiles(
    data: FeedbackCreateInput,
    files?: File[],
    params?: Record<string, any>
  ): Promise<FeedbackEntity> {
    const formData = new FormData()

    // Add feedback data
    formData.append('title', data.title)
    if (data.details) formData.append('details', data.details)
    if (data.priority) formData.append('priority', data.priority)
    if (data.appVersion) formData.append('appVersion', data.appVersion)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))
    if (data.attachments) formData.append('attachments', JSON.stringify(data.attachments))
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))

    // Add files
    if (files) {
      for (const file of files) {
        formData.append('files', file)
      }
    }

    // Add additional params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value))
      }
    }

    const res = await this.client.post(`/${this.resource}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data
  }

  /**
   * Updates feedback with additional files.
   * @param id - The feedback ID.
   * @param data - The update data.
   * @param files - Optional array of files to attach.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the updated Feedback entity.
   */
  async updateWithFiles(
    id: string,
    data: FeedbackUpdateInput,
    files?: File[],
    params?: Record<string, any>
  ): Promise<FeedbackEntity> {
    const formData = new FormData()

    // Add update data
    if (data.title) formData.append('title', data.title)
    if (data.details) formData.append('details', data.details)
    if (data.status) formData.append('status', data.status)
    if (data.priority) formData.append('priority', data.priority)
    if (data.appVersion) formData.append('appVersion', data.appVersion)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))
    if (data.attachments) formData.append('attachments', JSON.stringify(data.attachments))
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
    if (data.comment) formData.append('comment', data.comment)

    // Add files
    if (files) {
      for (const file of files) {
        formData.append('files', file)
      }
    }

    // Add additional params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        formData.append(key, String(value))
      }
    }

    const res = await this.client.put(`/${this.resource}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data
  }
}
