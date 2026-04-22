import { AxiosInstance } from 'axios'
import { ListResponse, ModelRepository } from './repository.js'
import {
  TemplateComponentEntity,
  TemplateComponentCreateInput,
  TemplateComponentUpdateInput,
  TemplateComponentPolicy,
} from '../../core/entities/template_component.js'

/**
 * Filters accepted by `GET /api/v1/template_components`.
 *
 * Two surfaces share the same endpoint:
 *  - **Library** — pass `storeId`. Returns all entries the caller has
 *    access to under that store (private + unlisted + public + deprecated
 *    when authenticated; only the discoverable subset for guests).
 *  - **Marketplace** — omit `storeId`. Returns only `policy in
 *    (public, deprecated)` across the whole platform.
 *
 * Free-text search and `filterator` are forwarded to the backend's
 * filterator pipeline (`backend/app/models/filters/template_component_filter.ts`).
 * The shape mirrors `ProductsListOptions` so this feels consistent
 * for callers already using other repositories.
 */
export interface TemplateComponentListOptions {
  page?: number
  offset?: number
  limit?: number

  /** Library mode — scope to one store. Omit for marketplace mode. */
  storeId?: string
  /** Free-text search across title/subtitle/body/category/tags. */
  q?: string
  search?: string
  /** Inclusive policy filter (defaults to all visible). */
  policy?: TemplateComponentPolicy | TemplateComponentPolicy[]
  /** Inclusive category filter. */
  category?: string | string[]
  /** Inclusive tag filter (any-of). */
  tags?: string | string[]
  /** Filter by fork ancestry. */
  parentId?: string

  /**
   * Raw `filterator` JSON payload. When set, the simple shorthand
   * filters above are merged in so callers can mix-and-match. See
   * the filterator README in the backend for grammar.
   */
  filterator?: string | object

  orderBy?: 'created_at' | 'updated_at' | 'title' | 'price'
  /** Catch-all for filters this repo doesn't enumerate yet. */
  params?: Record<string, unknown>
}

/**
 * Normalize the filterator option so the wire always sees a JSON
 * string. Accepting an object on the client side is a quality-of-life
 * affordance — callers don't need to remember to `JSON.stringify`.
 */
function normalizeFilterator(
  value: TemplateComponentListOptions['filterator']
): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

/**
 * Lift a paginated or array response into the repository's standard
 * `ListResponse` shape. Mirrors `image_prompt_templates.ts`.
 */
function toListResponse(value: unknown): ListResponse<TemplateComponentEntity> {
  if (Array.isArray(value)) {
    return { data: value as TemplateComponentEntity[] }
  }
  const record = value && typeof value === 'object' ? (value as Record<string, any>) : {}
  const meta = record.meta && typeof record.meta === 'object' ? record.meta : {}
  return {
    data: Array.isArray(record.data) ? (record.data as TemplateComponentEntity[]) : [],
    total: Number(meta.total ?? 0) || undefined,
    page: Number(meta.current_page ?? meta.currentPage ?? 0) || undefined,
    limit: Number(meta.per_page ?? meta.perPage ?? 0) || undefined,
  }
}

/**
 * Repository for the per-store **library of reusable custom components**
 * and the cross-store **marketplace** of public ones.
 *
 * On top of the standard CRUD inherited from {@link ModelRepository}, this
 * exposes a {@link fork} action that copies a (typically marketplace) entry
 * into the caller's store with a fresh id and a `parentId` pointing at the
 * source — the "I want full control of this component" escape hatch from
 * the reference model.
 *
 * Note on `version`: never sent on create/update. The server bumps it
 * automatically when one of the meaningful columns (`code`,
 * `propsSchema`, `slotsSchema`, `propsDefault`, `slotsDefault`,
 * `slotsLayout`) changes.
 */
export class TemplateComponentsRepository extends ModelRepository<
  TemplateComponentEntity,
  TemplateComponentCreateInput,
  TemplateComponentUpdateInput
> {
  constructor(client: AxiosInstance) {
    super('template_components', client)
  }

  /**
   * Override `list` to expose the full search/filter surface and accept
   * either the structured options or a raw `filterator` payload.
   */
  async list(
    options?: TemplateComponentListOptions
  ): Promise<ListResponse<TemplateComponentEntity>> {
    const { page, offset, limit, params, filterator, ...filters } = options || {}

    const res = await this.client.get(`/${this.resource}`, {
      params: {
        page,
        offset,
        limit,
        ...(filters.storeId ? { storeId: filters.storeId } : {}),
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.policy ? { policy: filters.policy } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.tags ? { tags: filters.tags } : {}),
        ...(filters.parentId ? { parentId: filters.parentId } : {}),
        ...(filters.orderBy ? { orderBy: filters.orderBy } : {}),
        ...(filterator ? { filterator: normalizeFilterator(filterator) } : {}),
        ...params,
      },
    })

    return toListResponse(res.data)
  }

  /**
   * Fork an existing entry into a target store.
   *
   * Always called against the **source** entry's id (`fromId`). The
   * destination store must be one the caller can `create` in. The new
   * entry starts in `private` — surfacing it requires a follow-up
   * `update`. `parentId` of the fork points at `fromId`, preserving the
   * fork tree for analytics/audit.
   *
   * Optional `title` lets the caller rename at fork time so multiple
   * forks of the same source can coexist in the destination library
   * without collision in the picker.
   */
  async fork(options: {
    fromId: string
    storeId: string
    title?: string
  }): Promise<TemplateComponentEntity> {
    const res = await this.client.post(`/${this.resource}/${options.fromId}/fork`, {
      storeId: options.storeId,
      ...(options.title ? { title: options.title } : {}),
    })
    return res.data as TemplateComponentEntity
  }
}
