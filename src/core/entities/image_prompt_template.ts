import {
  AttachmentPayload,
  normalizeAttachmentPayloads,
  serializeAttachmentPayloads,
} from './attachment.js'

/**
 * Image prompt template entity used by merchant AI product-image flows.
 */
export interface ImagePromptTemplate {
  id: string
  name: string
  description: string | null
  prompt: string
  tags: string[]
  attachments: AttachmentPayload[]
  previewImageUrl: string | null
  propsSchema: Record<string, unknown>
  props: Record<string, unknown>
  createdAt: string
  updatedAt: string | null
}

export interface ImagePromptTemplateCreate {
  name: string
  description?: string | null
  prompt: string
  tags?: string[]
  attachments?: AttachmentPayload[]
  previewImageUrl?: string | null
  propsSchema?: Record<string, unknown>
  props?: Record<string, unknown>
}

export interface ImagePromptTemplateUpdate {
  name?: string
  description?: string | null
  prompt?: string
  tags?: string[]
  attachments?: AttachmentPayload[]
  previewImageUrl?: string | null
  propsSchema?: Record<string, unknown>
  props?: Record<string, unknown>
  setToNull?: string[]
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function requiredString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : String(value ?? fallback)
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null

  const normalized = String(value)
  return normalized.length > 0 ? normalized : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => String(item)).filter((item) => item.trim().length > 0)
}

function normalizeObject(value: unknown): Record<string, unknown> {
  return asRecord(value)
}

export function normalizeImagePromptTemplate(value: unknown): ImagePromptTemplate {
  const record = asRecord(value)

  return {
    id: requiredString(record.id),
    name: requiredString(record.name),
    description: nullableString(record.description),
    prompt: requiredString(record.prompt),
    tags: normalizeStringArray(record.tags),
    attachments: normalizeAttachmentPayloads(record.attachments),
    previewImageUrl: nullableString(record.previewImageUrl ?? record.preview_image_url),
    propsSchema: normalizeObject(record.propsSchema ?? record.props_schema),
    props: normalizeObject(record.props),
    createdAt: requiredString(record.createdAt ?? record.created_at),
    updatedAt: nullableString(record.updatedAt ?? record.updated_at),
  }
}

export function serializeImagePromptTemplateCreate(
  value: ImagePromptTemplateCreate
): Record<string, unknown> {
  return {
    name: value.name,
    description: value.description ?? null,
    prompt: value.prompt,
    tags: value.tags ?? [],
    attachments: serializeAttachmentPayloads(value.attachments),
    previewImageUrl: value.previewImageUrl ?? null,
    propsSchema: value.propsSchema ?? {},
    props: value.props ?? {},
  }
}

export function serializeImagePromptTemplateUpdate(
  value: ImagePromptTemplateUpdate
): Record<string, unknown> {
  return {
    ...(value.name !== undefined ? { name: value.name } : {}),
    ...(value.description !== undefined ? { description: value.description } : {}),
    ...(value.prompt !== undefined ? { prompt: value.prompt } : {}),
    ...(value.tags !== undefined ? { tags: value.tags } : {}),
    ...(value.attachments !== undefined
      ? { attachments: serializeAttachmentPayloads(value.attachments) }
      : {}),
    ...(value.previewImageUrl !== undefined ? { previewImageUrl: value.previewImageUrl } : {}),
    ...(value.propsSchema !== undefined ? { propsSchema: value.propsSchema } : {}),
    ...(value.props !== undefined ? { props: value.props } : {}),
    ...(value.setToNull !== undefined ? { setToNull: value.setToNull } : {}),
  }
}
