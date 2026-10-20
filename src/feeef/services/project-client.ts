// Generated from the canonical project client; run sync-template-project-adapters.mjs.
export type SourceFiles = Record<string, string>
export type Change =
  | { kind: 'create'; path: string; text: string }
  | { kind: 'edit'; path: string; expectedHash: string; text: string }
  | { kind: 'delete'; path: string; expectedHash: string }
  | { kind: 'rename'; path: string; to: string; expectedHash: string }
export interface Project {
  id: string
  ownerStoreId: string
  title: string
  runtime: 'helium' | 'lithium'
  version: number
  publishedRevisionId: string | null
  upstreamBaseRevisionId: string | null
}
export interface Workspace {
  id: string
  projectId: string
  baseRevisionId: string | null
  version: number
  closed: boolean
  files: SourceFiles
  manifest: Record<string, { hash: string; bytes: number }>
}
export interface Build {
  id: string
  projectId: string
  workspaceId: string
  workspaceVersion: number
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  inputHash: string
  snapshotHash: string
  artifactHash: string | null
  diagnostics: unknown[]
}
export interface Installed {
  projectId: string
  projectVersion: number
  revisionId: string
  publishedRevisionId: string | null
  snapshotHash: string
  installation: {
    installationVersion: number
    revisionId: string
    artifactHash: string
    runtime: string
  }
}
export interface Publication {
  revisionId: string
  projectId: string
  projectVersion: number
  workspaceVersion: number
  snapshotHash: string
  inputHash: string
  artifactHash: string
  installation: { version: number } | null
}
export type Request = (method: string, path: string, body?: unknown) => Promise<any>
const e = encodeURIComponent
export class ProjectClient {
  private request: Request
  constructor(request: Request) {
    this.request = request
  }
  private root(id: string) {
    return `/template-projects/${e(id)}`
  }
  installed(storeId: string): Promise<Installed> {
    return this.request('GET', `/stores/${e(storeId)}/template-project`)
  }
  create(input: {
    ownerStoreId: string
    title: string
    runtime: 'helium' | 'lithium'
  }): Promise<Project> {
    return this.request('POST', '/template-projects', input)
  }
  project(id: string): Promise<Project> {
    return this.request('GET', this.root(id))
  }
  source(id: string, revisionId: string): Promise<SourceFiles> {
    return this.request('GET', `${this.root(id)}/revisions/${e(revisionId)}/source`)
  }
  open(
    id: string,
    input: { expectedProjectVersion: number; baseRevisionId: string | null; files?: SourceFiles },
  ): Promise<Workspace> {
    return this.request('POST', `${this.root(id)}/workspaces`, input)
  }
  workspace(id: string, ws: string): Promise<Workspace> {
    return this.request('GET', `${this.root(id)}/workspaces/${e(ws)}`)
  }
  patch(id: string, ws: string, expectedVersion: number, changes: Change[]): Promise<Workspace> {
    return this.request('PATCH', `${this.root(id)}/workspaces/${e(ws)}/files`, {
      expectedVersion,
      changes,
    })
  }
  checkpoint(id: string, ws: string, expectedVersion: number): Promise<unknown> {
    return this.request('POST', `${this.root(id)}/workspaces/${e(ws)}/checkpoints`, {
      expectedVersion,
    })
  }
  rebase(
    id: string,
    ws: string,
    input: { expectedVersion: number; expectedProjectVersion: number; revisionId: string },
  ): Promise<unknown> {
    return this.request('POST', `${this.root(id)}/workspaces/${e(ws)}/rebase`, input)
  }
  queue(
    id: string,
    ws: string,
    expectedWorkspaceVersion: number,
    idempotencyKey: string,
  ): Promise<Build> {
    return this.request('POST', `${this.root(id)}/workspaces/${e(ws)}/builds`, {
      expectedWorkspaceVersion,
      idempotencyKey,
    })
  }
  run(id: string, build: string): Promise<Build> {
    return this.request('POST', `${this.root(id)}/builds/${e(build)}/run`, {})
  }
  build(id: string, build: string): Promise<Build> {
    return this.request('GET', `${this.root(id)}/builds/${e(build)}`)
  }
  cancel(id: string, build: string): Promise<unknown> {
    return this.request('POST', `${this.root(id)}/builds/${e(build)}/cancel`, {})
  }
  publish(
    id: string,
    input: {
      buildId: string
      expectedProjectVersion: number
      expectedWorkspaceVersion: number
      inputHash: string
      artifactHash: string
      idempotencyKey: string
      message: string
      activate?: { storeId: string; expectedInstallationVersion: number }
    },
  ): Promise<Publication> {
    return this.request('POST', `${this.root(id)}/publish`, input)
  }
  preview(
    id: string,
    input: {
      buildId: string
      storeId: string
      expectedWorkspaceVersion: number
      ttlSeconds: number
    },
  ): Promise<{ previewId: string; token: string }> {
    return this.request('POST', `${this.root(id)}/previews`, input)
  }
  activate(
    storeId: string,
    input: {
      revisionId: string
      expectedInstallationVersion: number
      idempotencyKey: string
      operation: 'install' | 'activate' | 'restore' | 'reset'
    },
  ): Promise<unknown> {
    return this.request('POST', `/stores/${e(storeId)}/template-installation`, input)
  }
}
