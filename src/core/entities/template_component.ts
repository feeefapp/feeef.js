/**
 * Template-component library entry.
 *
 * One row in the per-store **library of reusable custom components** that
 * the template editor can drop in by reference instead of inlining
 * `code` + `propsSchema` per instance.
 *
 * Conceptual split:
 *  - This entity holds the **identity** of a custom component: the JSX
 *    `code`, its `propsSchema` / `slotsSchema`, and seed defaults.
 *  - Each placement of the component in a store's `templateData` carries
 *    only its instance-level `props` / `slots` and a reference back to
 *    this entry by `id`. Editing this entry's `code` therefore updates
 *    every reference in one shot.
 *
 * Backed by the Postgres table `template_components`
 * (`backend/database/migrations/.../create_template_components_table.ts`).
 */
export interface TemplateComponentEntity {
  /** Surrogate primary key (24-char cuid2 from backend `genid()`). */
  id: string
  /** Owner store. References cascade-delete with the store. */
  storeId: string
  /** Creator user. Audit field; never null. */
  userId: string

  // ── Catalog metadata ──────────────────────────────────────────────────
  title: string
  /** Short one-liner shown in cards and pickers. */
  subtitle: string | null
  /** Long markdown body for the entry's detail page. */
  body: string | null
  /** Free-form taxonomy ('hero' | 'cta' | 'product' | …). */
  category: string | null
  tags: string[]
  /** Primary preview image (square-ish, 1:1 or 4:3). */
  imageUrl: string | null
  /** Additional preview images for the marketplace gallery. */
  screenshots: string[]
  /** Optional public demo URL (e.g. a Lithium playground page). */
  demoUrl: string | null

  // ── Pricing (marketplace) ────────────────────────────────────────────
  /** One-time price in the platform default currency (DZD today). */
  price: number
  /** Absolute discount in the same currency. Nullable; defaults to 0. */
  discount: number | null
  /** Free-text license identifier (e.g. 'MIT', 'proprietary'). */
  license: string | null

  // ── Component identity (what makes the component itself) ──────────────
  /** JSX source executed by `react-live` in the storefront. */
  code: string
  /** Editor schema for instance-editable props. */
  propsSchema: Record<string, unknown>
  /** Editor schema for named slots, when the component supports children. */
  slotsSchema: Record<string, unknown> | null
  /** Seed values for new instances — instances may override freely. */
  propsDefault: Record<string, unknown>
  /** Seed slot children for new instances. */
  slotsDefault: Record<string, unknown> | null
  /** Editor-only responsive layout hint for slots (sm/md/lg). */
  slotsLayout: Record<string, unknown> | null

  // ── Distribution & lifecycle ──────────────────────────────────────────
  /**
   * Combined audience + lifecycle in a single dimension.
   * See {@link TemplateComponentPolicy} for the precise semantics of
   * each value.
   */
  policy: TemplateComponentPolicy
  /** Fork tree: id of the entry this one was copied from, if any. */
  parentId: string | null
  /**
   * Monotonic counter bumped on every meaningful edit.
   * Used as a cache-key suffix and (later) as the pinning target.
   */
  version: number

  // ── Timestamps ────────────────────────────────────────────────────────
  // `any` to stay compatible across runtimes — backend Lucid models
  // hand out luxon `DateTime` instances, the wire is ISO 8601 strings,
  // and consumers may rehydrate to `Date`. Mirrors `ProductEntity`.
  createdAt: any
  updatedAt: any | null
  /** Soft-delete marker. Resolver treats deleted entries as missing. */
  deletedAt: any | null
}

/**
 * Combined audience + lifecycle dimension for a library entry.
 *
 *  - `private`     Owner-only (default). Not shareable, hidden from
 *                  marketplace and direct-link installs.
 *  - `unlisted`    Accessible by direct link / install token only;
 *                  not surfaced in marketplace search.
 *  - `public`      Discoverable and installable from the marketplace.
 *  - `deprecated`  Still resolves for existing followers and remains
 *                  visible in the marketplace with a "deprecated" badge,
 *                  but new installs are discouraged.
 */
export enum TemplateComponentPolicy {
  private = 'private',
  unlisted = 'unlisted',
  public = 'public',
  deprecated = 'deprecated',
}

/**
 * Input for creating a new library entry.
 *
 * `storeId` and `userId` are derived server-side from the authenticated
 * request; they are intentionally absent here.
 */
export interface TemplateComponentCreateInput {
  title: string
  code: string
  /** Defaults to `'private'` server-side when omitted. */
  policy?: TemplateComponentPolicy

  subtitle?: string | null
  body?: string | null
  category?: string | null
  tags?: string[]
  imageUrl?: string | null
  screenshots?: string[]
  demoUrl?: string | null

  price?: number
  discount?: number | null
  license?: string | null

  propsSchema?: Record<string, unknown>
  slotsSchema?: Record<string, unknown> | null
  propsDefault?: Record<string, unknown>
  slotsDefault?: Record<string, unknown> | null
  slotsLayout?: Record<string, unknown> | null

  /** When forking an existing entry, point back at it for the fork tree. */
  parentId?: string | null
}

/**
 * Input for updating an existing library entry.
 *
 * Per the Node SDK nullability convention:
 *  - `undefined` = field unchanged
 *  - `null`      = clear the nullable field
 *
 * The server bumps `version` automatically when any of `code`,
 * `propsSchema`, `slotsSchema`, `propsDefault`, `slotsDefault`,
 * or `slotsLayout` changes; clients do not send `version`.
 */
export interface TemplateComponentUpdateInput {
  title?: string
  subtitle?: string | null
  body?: string | null
  category?: string | null
  tags?: string[]
  imageUrl?: string | null
  screenshots?: string[]
  demoUrl?: string | null

  price?: number
  discount?: number | null
  license?: string | null

  code?: string
  propsSchema?: Record<string, unknown>
  slotsSchema?: Record<string, unknown> | null
  propsDefault?: Record<string, unknown>
  slotsDefault?: Record<string, unknown> | null
  slotsLayout?: Record<string, unknown> | null

  policy?: TemplateComponentPolicy
}
