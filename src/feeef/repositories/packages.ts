import type { AxiosInstance } from 'axios'

/**
 * Template system v3.1 (docs/template-system/SPEC.md): store packages (templates and component
 * packages), drafts, versions, the live template, marketplace, licences, reviews and store pages.
 * Errors are `{code, message, ...details}`; build errors carry `diagnostics`.
 */

export type PackageKind = 'template' | 'component'

export interface PackageEntity {
  id: string
  ownerStoreId: string
  kind: PackageKind
  slug: string
  title: string
  summary: string | null
  coverUrl: string | null
  price: number
  discount: number | null
  salePrice: number
  currency: string
  visibility: 'private' | 'unlisted' | 'public'
  moderation: string
  featured: boolean
  salesClosed: boolean
  upstreamPackageId: string | null
  latestVersionId: string | null
  ratingAvg: number | null
  ratingCount: number
  createdAt: string
  updatedAt: string | null
}

export interface PackageVersionEntity {
  id: string
  packageId: string
  number: number
  parentVersionId: string | null
  upstreamVersionId: string | null
  artifactHash: string
  /** Hash of the compiled code (components, routes, layout); shared by stores on the same code. */
  codeHash?: string
  /** Hash of the content (theme, messages, slot content); a content-only edit keeps `codeHash`. */
  contentHash?: string
  engine: string
  message: string | null
  published: boolean
  yankedAt: string | null
  createdAt: string
  /** Marketplace listings only. */
  artifactUrl?: string
}

export interface PackageDraftEntity {
  id: string
  storeId: string
  packageId: string
  baseVersionId: string | null
  upstreamVersionId: string | null
  version: number
  filesHash: string
  files: Record<string, string>
  updatedAt: string
}

export interface PackageDiagnostic {
  severity: 'error'
  code: string
  message: string
  file: string | null
  line: number | null
  column: number | null
}

export interface LiveTemplate {
  versionId: string
  packageId: string
  engine: string
  artifactHash: string
  artifactUrl: string
}

/** A placed component: `use` is a component id (`hero`), `<dependency>/<component>` or `core/<id>`. */
export type ContentNode = {
  id: string
  use: string
  props?: Record<string, unknown>
  slots?: Record<string, ContentNode[]>
  hydrate?: 'never' | 'load' | 'idle' | 'visible' | 'interaction'
}

/** Slot content of a route, the layout or a store page (`content/*.json`). */
export type SlotContent = { slots?: Record<string, ContentNode[]> }

export interface StorePageEntity {
  id: string
  storeId: string
  productId: string | null
  path: string
  title: string | null
  /** Draft content, e.g. `{slots: {main: [...]}}`. Omitted in lists. */
  content?: SlotContent
  seo: Record<string, unknown>
  status: 'draft' | 'published'
  version: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string | null
}

/** One file change: `text: null` deletes the file. */
export type FileChange = { path: string; text: string | null }

const store = (storeId: string) => `/stores/${encodeURIComponent(storeId)}`
const pkg = (storeId: string, packageId: string) =>
  `${store(storeId)}/packages/${encodeURIComponent(packageId)}`
const page = (storeId: string, pageId: string) =>
  `${store(storeId)}/pages/${encodeURIComponent(pageId)}`

export class PackagesRepository {
  constructor(private readonly client: AxiosInstance) {}

  private async call<T>(
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    url: string,
    data?: unknown,
    params?: unknown
  ): Promise<T> {
    const response = await this.client.request<T>({ method, url, data, params })
    return response.data
  }

  // ------------------------------------------------------------ store packages

  list(storeId: string, params?: { kind?: PackageKind }) {
    return this.call<{ data: PackageEntity[]; liveVersionId: string | null }>(
      'get',
      `${store(storeId)}/packages`,
      undefined,
      params
    )
  }
  create(storeId: string, data: { kind: PackageKind; title: string; slug?: string }) {
    return this.call<PackageEntity>('post', `${store(storeId)}/packages`, data)
  }
  find(storeId: string, packageId: string) {
    return this.call<PackageEntity & { versions: PackageVersionEntity[]; update: UpdateStatus }>(
      'get',
      pkg(storeId, packageId)
    )
  }
  update(
    storeId: string,
    packageId: string,
    data: Partial<
      Pick<
        PackageEntity,
        'title' | 'summary' | 'coverUrl' | 'price' | 'discount' | 'visibility' | 'salesClosed'
      >
    >
  ) {
    return this.call<PackageEntity>('patch', pkg(storeId, packageId), data)
  }

  // -------------------------------------------------------------------- drafts

  draft(storeId: string, packageId: string) {
    return this.call<PackageDraftEntity>('get', `${pkg(storeId, packageId)}/draft`)
  }
  /** Compare-and-swap on the draft version; 409 `DRAFT_CONFLICT` carries the current version. */
  patchDraft(storeId: string, packageId: string, expectedVersion: number, changes: FileChange[]) {
    return this.call<Omit<PackageDraftEntity, 'files'>>(
      'patch',
      `${pkg(storeId, packageId)}/draft`,
      { expectedVersion, changes }
    )
  }
  discardDraft(storeId: string, packageId: string) {
    return this.call<PackageDraftEntity>('post', `${pkg(storeId, packageId)}/draft/discard`)
  }
  check(storeId: string, packageId: string) {
    return this.call<{
      ok: boolean
      draftVersion: number
      artifactHash?: string
      diagnostics: PackageDiagnostic[]
    }>('post', `${pkg(storeId, packageId)}/draft/check`)
  }
  /** Open `<storefront>/?preview=<token>` within 15 minutes. */
  preview(storeId: string, packageId: string) {
    return this.call<{ token: string; artifactHash: string; draftVersion: number }>(
      'post',
      `${pkg(storeId, packageId)}/draft/preview`
    )
  }
  publish(
    storeId: string,
    packageId: string,
    data: { expectedDraftVersion: number; message?: string; activate?: boolean }
  ) {
    return this.call<PackageVersionEntity>('post', `${pkg(storeId, packageId)}/publish`, data)
  }

  // ------------------------------------------------------------------ versions

  versionFiles(storeId: string, packageId: string, versionId: string) {
    return this.call<PackageVersionEntity & { files: Record<string, string> }>(
      'get',
      `${pkg(storeId, packageId)}/versions/${encodeURIComponent(versionId)}/files`
    )
  }
  setPublished(storeId: string, packageId: string, versionId: string, published = true) {
    return this.call<PackageVersionEntity>(
      'post',
      `${pkg(storeId, packageId)}/versions/${encodeURIComponent(versionId)}/published`,
      { published }
    )
  }
  yank(storeId: string, packageId: string, versionId: string) {
    return this.call<PackageVersionEntity>(
      'post',
      `${pkg(storeId, packageId)}/versions/${encodeURIComponent(versionId)}/yank`
    )
  }
  updateStatus(storeId: string, packageId: string) {
    return this.call<UpdateStatus>('get', `${pkg(storeId, packageId)}/update`)
  }
  /** Three-way merge of the newest upstream version into the draft. */
  mergeUpdate(storeId: string, packageId: string) {
    return this.call<{
      draft: PackageDraftEntity
      conflicts: string[]
      mergedFrom: string
      upstreamNumber: number
    }>('post', `${pkg(storeId, packageId)}/update/merge`)
  }

  // ------------------------------------------------------------- live template

  live(storeId: string) {
    return this.call<LiveTemplate>('get', `${store(storeId)}/template`)
  }
  setLive(storeId: string, versionId: string) {
    return this.call<PackageVersionEntity>('put', `${store(storeId)}/template`, { versionId })
  }

  // --------------------------------------------------------------- marketplace

  marketplace(params?: { kind?: PackageKind; q?: string; page?: number; perPage?: number }) {
    return this.call<{ data: PackageEntity[]; meta: Record<string, unknown> }>(
      'get',
      '/packages',
      undefined,
      params
    )
  }
  marketplaceFind(packageId: string) {
    return this.call<PackageEntity & { versions: PackageVersionEntity[] }>(
      'get',
      `/packages/${encodeURIComponent(packageId)}`
    )
  }
  /** Templates: the store gets its own copy (full source). Components: a licence to pin them. */
  install(
    storeId: string,
    data: { packageId: string; expectedPrice?: number; activate?: boolean }
  ) {
    return this.call<{
      licenceId: string | null
      package: PackageEntity
      version: PackageVersionEntity
    }>('post', `${store(storeId)}/packages/install`, data)
  }
  licences(storeId: string) {
    return this.call<{
      data: { id: string; packageId: string; versionId: string; createdAt: string }[]
    }>('get', `${store(storeId)}/licences`)
  }
  reviews(packageId: string) {
    return this.call<{
      data: { id: string; rating: number; body: string | null; createdAt: string }[]
    }>('get', `/packages/${encodeURIComponent(packageId)}/reviews`)
  }
  review(storeId: string, packageId: string, data: { rating: number; body?: string }) {
    return this.call<unknown>('post', `${pkg(storeId, packageId)}/review`, data)
  }

  // --------------------------------------------------------------- store pages

  pages(
    storeId: string,
    params?: { kind?: 'page' | 'landing'; productId?: string; search?: string }
  ) {
    return this.call<{ data: StorePageEntity[] }>(
      'get',
      `${store(storeId)}/pages`,
      undefined,
      params
    )
  }
  page(storeId: string, pageId: string) {
    return this.call<StorePageEntity>('get', page(storeId, pageId))
  }
  /** The published page at [path], for storefronts (404 when none). */
  resolvePage(storeId: string, path: string) {
    return this.call<StorePageEntity>('get', `${store(storeId)}/pages/resolve`, undefined, { path })
  }
  createPage(
    storeId: string,
    data: { path: string; title?: string; content?: SlotContent; productId?: string }
  ) {
    return this.call<StorePageEntity>('post', `${store(storeId)}/pages`, data)
  }
  /** Version-checked edit of any of `path, title, content, seo, productId`. */
  updatePage(
    storeId: string,
    pageId: string,
    data: { expectedVersion: number } & Partial<
      Pick<StorePageEntity, 'path' | 'title' | 'content' | 'seo' | 'productId'>
    >
  ) {
    return this.call<StorePageEntity>('patch', page(storeId, pageId), data)
  }
  publishPage(storeId: string, pageId: string, expectedVersion?: number) {
    return this.call<StorePageEntity>('post', `${page(storeId, pageId)}/publish`, {
      expectedVersion,
    })
  }
  unpublishPage(storeId: string, pageId: string) {
    return this.call<StorePageEntity>('post', `${page(storeId, pageId)}/unpublish`)
  }
  duplicatePage(storeId: string, pageId: string) {
    return this.call<StorePageEntity>('post', `${page(storeId, pageId)}/duplicate`)
  }
  deletePage(storeId: string, pageId: string) {
    return this.call<unknown>('delete', page(storeId, pageId))
  }
  /** `{token, path}`: open `<storefront><path>?pagePreview=<token>`. */
  previewPage(storeId: string, pageId: string) {
    return this.call<{ token: string; path: string }>('post', `${page(storeId, pageId)}/preview`)
  }
}

export type UpdateStatus =
  | { available: false; current?: number | null }
  | { available: true; current: number | null; latest: number; latestVersionId: string }
