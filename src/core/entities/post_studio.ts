/**
 * Poststudio project entity (`/postStudios`).
 */

export type PostStudioStatus = 'draft' | 'ready'

export type PostStudioPrimaries = Partial<Record<string, string>>

export interface PostStudio {
  id: string
  userId: string
  storeId: string | null
  brandStudioId: string | null
  name: string
  brief: string | null
  regionStyle: string | null
  formats: string[]
  primaries: PostStudioPrimaries
  attachments: unknown[]
  status: PostStudioStatus
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  primaryImages?: Record<string, unknown>
  generationCounts?: Record<string, number>
}

export interface PostStudioCreateInput {
  name: string
  brief?: string
  regionStyle?: string
  formats?: string[]
  storeId?: string
  brandStudioId?: string
  attachments?: unknown[]
  status?: PostStudioStatus
}

export interface PostStudioUpdateInput {
  name?: string
  brief?: string | null
  regionStyle?: string | null
  formats?: string[]
  storeId?: string | null
  brandStudioId?: string | null
  attachments?: unknown[]
  status?: PostStudioStatus
}

export interface PostStudioListOptions {
  page?: number
  limit?: number
  params?: Record<string, unknown>
}

export interface PostStudioGenerationsOptions {
  studioId: string
  kind: string
  page?: number
  limit?: number
}

export interface PostStudioSetPrimaryInput {
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

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter((s) => s.length > 0)
}

function normalizePrimaries(value: unknown): PostStudioPrimaries {
  const record = asRecord(value)
  const out: PostStudioPrimaries = {}
  for (const [key, raw] of Object.entries(record)) {
    const id = nullableString(raw)
    if (id) out[key] = id
  }
  return out
}

/** Normalize a Poststudio API payload (camelCase or snake_case). */
export function normalizePostStudio(value: unknown): PostStudio {
  const record = asRecord(value)
  const nested = asRecord(record.data)
  const source = nested.id ? nested : record

  const studio: PostStudio = {
    id: requiredString(source.id),
    userId: requiredString(source.userId ?? source.user_id),
    storeId: nullableString(source.storeId ?? source.store_id),
    brandStudioId: nullableString(source.brandStudioId ?? source.brand_studio_id),
    name: requiredString(source.name),
    brief: nullableString(source.brief),
    regionStyle: nullableString(source.regionStyle ?? source.region_style),
    formats: normalizeStringArray(source.formats),
    primaries: normalizePrimaries(source.primaries),
    attachments: Array.isArray(source.attachments) ? source.attachments : [],
    status: (source.status as PostStudioStatus) || 'draft',
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
