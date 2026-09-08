/**
 * Brandstudio project entity (`/brandStudios`).
 */

export type BrandStudioStatus = 'draft' | 'ready'

/** brandAssetKind → primary image_generation id */
export type BrandStudioPrimaries = Partial<Record<string, string>>

export interface BrandStudio {
  id: string
  userId: string
  storeId: string | null
  name: string
  brief: string | null
  style: string | null
  palette: number[]
  boardAspect: string
  primaries: BrandStudioPrimaries
  attachments: unknown[]
  status: BrandStudioStatus
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  /** Optional hydrated primary generations keyed by kind (from show). */
  primaryImages?: Record<string, unknown>
  /** Optional per-kind generation counts (from show). */
  generationCounts?: Record<string, number>
}

export interface BrandStudioCreateInput {
  name: string
  brief?: string
  style?: string
  palette?: number[]
  boardAspect?: string
  storeId?: string
  attachments?: unknown[]
  status?: BrandStudioStatus
}

export interface BrandStudioUpdateInput {
  name?: string
  brief?: string | null
  style?: string | null
  palette?: number[]
  boardAspect?: string
  storeId?: string | null
  attachments?: unknown[]
  status?: BrandStudioStatus
}

export interface BrandStudioListOptions {
  page?: number
  limit?: number
  params?: Record<string, unknown>
}

export interface BrandStudioGenerationsOptions {
  studioId: string
  kind: string
  page?: number
  limit?: number
}

export interface BrandStudioSetPrimaryInput {
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

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => Number(item)).filter((n) => Number.isFinite(n))
}

function normalizePrimaries(value: unknown): BrandStudioPrimaries {
  const record = asRecord(value)
  const out: BrandStudioPrimaries = {}
  for (const [key, raw] of Object.entries(record)) {
    const id = nullableString(raw)
    if (id) out[key] = id
  }
  return out
}

/**
 * Normalize a Brandstudio API payload (camelCase or snake_case).
 */
export function normalizeBrandStudio(value: unknown): BrandStudio {
  const record = asRecord(value)
  const nested = asRecord(record.data)
  const source = nested.id ? nested : record

  const studio: BrandStudio = {
    id: requiredString(source.id),
    userId: requiredString(source.userId ?? source.user_id),
    storeId: nullableString(source.storeId ?? source.store_id),
    name: requiredString(source.name),
    brief: nullableString(source.brief),
    style: nullableString(source.style),
    palette: normalizeNumberArray(source.palette),
    boardAspect: requiredString(source.boardAspect ?? source.board_aspect, '4:3'),
    primaries: normalizePrimaries(source.primaries),
    attachments: Array.isArray(source.attachments) ? source.attachments : [],
    status: (source.status as BrandStudioStatus) || 'draft',
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
