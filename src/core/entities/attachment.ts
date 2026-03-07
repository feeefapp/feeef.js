/**
 * Shared AI attachment contract used by image prompt templates and image generations.
 */

export const ATTACHMENT_TYPES = ['image', 'url', 'audio', 'product', 'store'] as const

export type AttachmentType = (typeof ATTACHMENT_TYPES)[number]

export interface AttachmentBase {
  value: string
  label?: string | null
  prompt?: string | null
}

export interface ImageAttachmentPayload extends AttachmentBase {
  type: 'image'
}

export interface UrlAttachmentPayload extends AttachmentBase {
  type: 'url'
}

export interface AudioAttachmentPayload extends AttachmentBase {
  type: 'audio'
}

export interface ProductAttachmentPayload extends AttachmentBase {
  type: 'product'
}

export interface StoreAttachmentPayload extends AttachmentBase {
  type: 'store'
}

export type AttachmentPayload =
  | ImageAttachmentPayload
  | UrlAttachmentPayload
  | AudioAttachmentPayload
  | ProductAttachmentPayload
  | StoreAttachmentPayload

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

function nullableTrimmedString(value: unknown): string | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined

  const normalized = String(value).trim()
  return normalized.length > 0 ? normalized : undefined
}

export function isAttachmentType(value: unknown): value is AttachmentType {
  return typeof value === 'string' && ATTACHMENT_TYPES.includes(value as AttachmentType)
}

export function normalizeAttachmentPayload(value: unknown): AttachmentPayload | null {
  const record = asRecord(value)
  const type = record.type
  const normalizedValue = nullableTrimmedString(record.value)

  if (!isAttachmentType(type) || !normalizedValue) {
    return null
  }

  return {
    type,
    value: normalizedValue,
    label: nullableTrimmedString(record.label) ?? null,
    prompt: nullableTrimmedString(record.prompt) ?? null,
  }
}

export function normalizeAttachmentPayloads(value: unknown): AttachmentPayload[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => normalizeAttachmentPayload(item))
    .filter((item): item is AttachmentPayload => item !== null)
}

export function serializeAttachmentPayload(payload: AttachmentPayload): Record<string, unknown> {
  return {
    type: payload.type,
    value: payload.value,
    label: payload.label ?? null,
    prompt: payload.prompt ?? null,
  }
}

export function serializeAttachmentPayloads(
  attachments: AttachmentPayload[] | null | undefined
): Record<string, unknown>[] {
  if (!attachments || attachments.length === 0) return []
  return attachments.map((attachment) => serializeAttachmentPayload(attachment))
}
