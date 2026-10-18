/** Store-owned page draft; publishedDocument changes only on explicit publish. */
export interface StorePageDocument {
  path: string
  title?: string | null
  createdFromPage?: string | null
  root?: Record<string, unknown> | null
  props?: Record<string, unknown>
  sections?: Record<string, unknown>
  seo?: Record<string, unknown>
  data?: Record<string, unknown>
  locales?: Record<string, unknown>
  extensions?: Record<string, unknown>
}
export interface StorePageEntity extends StorePageDocument {
  id: string
  storeId: string
  status: 'draft' | 'published'
  draftRevision: number
  publishedRevision: number | null
  publishedDocument: StorePageDocument | null
  createdAt: string
  updatedAt: string | null
  publishedAt: string | null
  deletedAt: string | null
}
export interface InstalledTheme {
  data: Record<string, unknown>
  schema: Record<string, unknown>
  revision: string
  customized: boolean
  templateId: string | null
  installedReleaseId: string | null
  installation: Record<string, unknown> | null
}
export interface WebsiteExport {
  formatVersion: 1
  kind: 'page' | 'theme'
  data: Record<string, unknown>
  checksum: string
}
