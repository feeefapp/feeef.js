/**
 * Uistudio project entity (`/uiStudios`).
 */

export type UiStudioStatus = 'draft' | 'ready'

export type UiStudioPrimaries = Partial<Record<string, string>>

export interface UiStudio {
  id: string
  userId: string
  storeId: string | null
  brandStudioId: string | null
  name: string
  brief: string | null
  style: string | null
  canvas: Record<string, unknown>
  primaries: UiStudioPrimaries
  attachments: unknown[]
  status: UiStudioStatus
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  primaryImages?: Record<string, unknown>
  generationCounts?: Record<string, number>
}

export interface UiStudioCreateInput {
  name: string
  brief?: string
  style?: string
  canvas?: Record<string, unknown>
  storeId?: string
  brandStudioId?: string
  attachments?: unknown[]
  status?: UiStudioStatus
}

export interface UiStudioUpdateInput {
  name?: string
  brief?: string | null
  style?: string | null
  canvas?: Record<string, unknown>
  storeId?: string | null
  brandStudioId?: string | null
  attachments?: unknown[]
  status?: UiStudioStatus
}

export interface UiStudioListOptions {
  page?: number
  limit?: number
  params?: Record<string, unknown>
}

export interface UiStudioGenerationsOptions {
  studioId: string
  kind: string
  page?: number
  limit?: number
}

export interface UiStudioSetPrimaryInput {
  studioId: string
  kind: string
  generationId: string
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

function normalizePrimaries(value: unknown): UiStudioPrimaries {
  const record = asRecord(value)
  const out: UiStudioPrimaries = {}
  for (const [key, raw] of Object.entries(record)) {
    const id = nullableString(raw)
    if (id) out[key] = id
  }
  return out
}

/** Normalize a Uistudio API payload (camelCase or snake_case). */
export function normalizeUiStudio(value: unknown): UiStudio {
  const record = asRecord(value)
  const nested = asRecord(record.data)
  const source = nested.id ? nested : record

  const studio: UiStudio = {
    id: requiredString(source.id),
    userId: requiredString(source.userId ?? source.user_id),
    storeId: nullableString(source.storeId ?? source.store_id),
    brandStudioId: nullableString(source.brandStudioId ?? source.brand_studio_id),
    name: requiredString(source.name),
    brief: nullableString(source.brief),
    style: nullableString(source.style),
    canvas: asRecord(source.canvas),
    primaries: normalizePrimaries(source.primaries),
    attachments: Array.isArray(source.attachments) ? source.attachments : [],
    status: (source.status as UiStudioStatus) || 'draft',
    createdAt: requiredString(source.createdAt ?? source.created_at),
    updatedAt: nullableString(source.updatedAt ?? source.updated_at),
    deletedAt: nullableString(source.deletedAt ?? source.deleted_at),
  }

  if (source.primaryImages && typeof source.primaryImages === 'object') {
    studio.primaryImages = asRecord(source.primaryImages)
  }
  if (source.generationCounts && typeof source.generationCounts === 'object') {
    studio.generationCounts = asRecord(source.generationCounts) as Record<string, number>
  }

  return studio
}
