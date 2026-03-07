import { AttachmentPayload, serializeAttachmentPayloads } from './attachment.js'

export type ImageGenerationStatus = 'pending' | 'processing' | 'completed' | 'published' | 'failed'

export type ImageGenerationResolution =
  | 'MEDIA_RESOLUTION_LOW'
  | 'MEDIA_RESOLUTION_MEDIUM'
  | 'MEDIA_RESOLUTION_HIGH'

export type ImageGenerationAspectRatio =
  | '1:1'
  | '16:9'
  | '9:16'
  | '4:3'
  | '3:4'
  | '4:5'
  | '9:32'
  | '1:8'
  | '8:1'
  | '1:4'
  | '4:1'

export interface ImageGenerationHistoryItem {
  id: string
  createdAt: string
  generatedImageUrl: string | null
  configs: Record<string, unknown>
}

export interface ImageGenerationUserSummary {
  id: string
  name?: string | null
  photoUrl?: string | null
}

export interface ImageGeneration {
  id: string
  userId: string | null
  storeId: string | null
  title: string | null
  generatedImageUrl: string | null
  configs: Record<string, unknown>
  generations: ImageGenerationHistoryItem[]
  status: ImageGenerationStatus
  tags: string[]
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  user?: ImageGenerationUserSummary | null
}

export interface PaginatedResourceResponse<T> {
  data: T[]
  meta: Record<string, unknown>
  hasMore: boolean
  total?: number
  page?: number
  limit?: number
}

export interface ImageGenerationListOptions {
  page?: number
  limit?: number
  storeId?: string
  tags?: string[]
  params?: Record<string, unknown>
}

export interface ImageGenerationGalleryOptions {
  page?: number
  limit?: number
  params?: Record<string, unknown>
}

/** Output image size (generated image dimensions). Distinct from resolution (input). */
export type ImageGenerationImageSize = '1K' | '2K' | '4K'

export interface ImageGenerationGenerateInput {
  id?: string | null
  storeId?: string | null
  title?: string | null
  prompt?: string | null
  imageFile?: File | Blob | Uint8Array | ArrayBuffer | null
  aspectRatio?: ImageGenerationAspectRatio
  /** Output image size (1K/2K/4K). Backend default 2K when omitted. */
  imageSize?: ImageGenerationImageSize
  /** Input resolution (how reference images are processed). Default MEDIA_RESOLUTION_HIGH. */
  resolution?: ImageGenerationResolution
  systemInstructions?: string | null
  attachments?: AttachmentPayload[]
  model?: string | null
  googleSearch?: boolean
  imageSearch?: boolean
}

export interface ImageGenerationPublishInput {
  id: string
  isPublished: boolean
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null

  const normalized = String(value)
  return normalized.length > 0 ? normalized : null
}

function requiredString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : String(value ?? fallback)
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter((item) => item.trim().length > 0)
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return asRecord(value)
}

function normalizeHistoryItem(value: unknown): ImageGenerationHistoryItem {
  const record = asRecord(value)

  return {
    id: requiredString(record.id),
    createdAt: requiredString(record.createdAt ?? record.created_at),
    generatedImageUrl: nullableString(record.generatedImageUrl ?? record.generated_image_url),
    configs: normalizeObject(record.configs),
  }
}

function normalizeUserSummary(value: unknown): ImageGenerationUserSummary | null {
  const record = asRecord(value)
  if (!record.id) return null

  return {
    id: requiredString(record.id),
    name: nullableString(record.name),
    photoUrl: nullableString(record.photoUrl ?? record.photo_url),
  }
}

export function normalizeImageGeneration(value: unknown): ImageGeneration {
  const record = asRecord(value)

  return {
    id: requiredString(record.id),
    userId: nullableString(record.userId ?? record.user_id),
    storeId: nullableString(record.storeId ?? record.store_id),
    title: nullableString(record.title),
    generatedImageUrl: nullableString(record.generatedImageUrl ?? record.generated_image_url),
    configs: normalizeObject(record.configs),
    generations: Array.isArray(record.generations)
      ? record.generations.map((item) => normalizeHistoryItem(item))
      : [],
    status: (record.status as ImageGenerationStatus) || 'pending',
    tags: normalizeStringArray(record.tags),
    createdAt: requiredString(record.createdAt ?? record.created_at),
    updatedAt: nullableString(record.updatedAt ?? record.updated_at),
    deletedAt: nullableString(record.deletedAt ?? record.deleted_at),
    user: normalizeUserSummary(record.user),
  }
}

export function normalizePaginatedResponse<T>(
  value: unknown,
  mapper: (item: unknown) => T
): PaginatedResourceResponse<T> {
  const record = asRecord(value)
  const data = Array.isArray(record.data) ? record.data.map((item) => mapper(item)) : []
  const meta = asRecord(record.meta)
  const currentPage = Number(meta.current_page ?? meta.currentPage ?? 1)
  const lastPage = Number(meta.last_page ?? meta.lastPage ?? currentPage)
  const limit = Number(meta.per_page ?? meta.perPage ?? meta.limit ?? 0) || undefined
  const total = Number(meta.total ?? 0) || undefined

  return {
    data,
    meta,
    hasMore: currentPage < lastPage,
    total,
    page: currentPage,
    limit,
  }
}

function toBlob(value: File | Blob | Uint8Array | ArrayBuffer): Blob {
  if (value instanceof Blob) return value
  if (value instanceof Uint8Array) return new Blob([value], { type: 'image/png' })
  return new Blob([value], { type: 'image/png' })
}

export function createImageGenerationFormData(input: ImageGenerationGenerateInput): FormData {
  const formData = new FormData()

  if (input.id && input.id.trim().length > 0) formData.append('id', input.id.trim())
  if (input.storeId && input.storeId.trim().length > 0)
    formData.append('storeId', input.storeId.trim())
  if (input.title && input.title.trim().length > 0) formData.append('title', input.title.trim())
  if (input.prompt && input.prompt.trim().length > 0) formData.append('prompt', input.prompt.trim())
  if (input.aspectRatio) formData.append('aspectRatio', input.aspectRatio)
  if (input.imageSize) formData.append('imageSize', input.imageSize)
  formData.append('resolution', input.resolution ?? 'MEDIA_RESOLUTION_HIGH')
  if (input.systemInstructions && input.systemInstructions.trim().length > 0) {
    formData.append('systemInstructions', input.systemInstructions.trim())
  }
  if (input.attachments && input.attachments.length > 0) {
    formData.append('attachments', JSON.stringify(serializeAttachmentPayloads(input.attachments)))
  }
  if (input.model && input.model.trim().length > 0) formData.append('model', input.model.trim())
  if (typeof input.googleSearch === 'boolean') {
    formData.append('googleSearch', String(input.googleSearch))
  }
  if (typeof input.imageSearch === 'boolean') {
    formData.append('imageSearch', String(input.imageSearch))
  }
  if (input.imageFile) {
    const blob = toBlob(input.imageFile)
    const filename = `image_${Date.now()}.png`
    formData.append('imageFile', blob, filename)
  }

  return formData
}
