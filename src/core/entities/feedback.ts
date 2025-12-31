/**
 * Feedback status enum
 */
export enum FeedbackStatus {
  open = 'open',
  inProgress = 'in_progress',
  resolved = 'resolved',
  closed = 'closed',
}

/**
 * Feedback priority enum
 */
export enum FeedbackPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
  critical = 'critical',
}

/**
 * Feedback comment interface
 */
export interface FeedbackComment {
  id: string
  userId: string
  comment: string
  createdAt: any
}

/**
 * Feedback attachment interface
 */
export interface FeedbackAttachment {
  url: string
  name: string
  type: string
  size?: number
}

/**
 * Feedback entity interface
 */
export interface FeedbackEntity {
  id: string
  userId: string
  title: string
  details: string | null
  status: FeedbackStatus
  priority: FeedbackPriority
  tags: string[]
  attachments: FeedbackAttachment[]
  comments: FeedbackComment[]
  appVersion: string | null
  metadata: Record<string, any>
  resolvedAt: any | null
  createdAt: any
  updatedAt: any
}

/**
 * Input data for creating a new feedback
 */
export interface FeedbackCreateInput {
  title: string
  details?: string
  priority?: FeedbackPriority
  tags?: string[]
  attachments?: FeedbackAttachment[]
  appVersion?: string
  metadata?: Record<string, any>
}

/**
 * Input data for updating an existing feedback
 */
export interface FeedbackUpdateInput {
  title?: string
  details?: string
  status?: FeedbackStatus
  priority?: FeedbackPriority
  tags?: string[]
  attachments?: FeedbackAttachment[]
  appVersion?: string
  metadata?: Record<string, any>
  comment?: string
}

/**
 * Options for listing feedbacks
 */
export interface FeedbackListOptions {
  page?: number
  offset?: number
  limit?: number
  status?: FeedbackStatus[]
  priority?: FeedbackPriority[]
  tags?: string[]
  q?: string
  createdAfter?: Date | string
  createdBefore?: Date | string
  updatedAfter?: Date | string
  updatedBefore?: Date | string
  resolvedAfter?: Date | string
  resolvedBefore?: Date | string
  resolved?: boolean
}
