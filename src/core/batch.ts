/**
 * Shared types for AIP-style batch operations (`:batchDelete`, `:batchUpdate`, …).
 *
 * Repositories override {@link ModelRepository.deleteMany} / `updateMany` / `createMany`
 * when the API supports them. HTTP 200 does not mean all items succeeded — always
 * inspect `summary` and `failedRequests`.
 */

export interface BatchRpcStatus {
  code: string
  message: string
  details?: unknown
}

export interface BatchSummary {
  total: number
  succeeded: number
  failed: number
}

export function batchSummaryHasFailures(summary: BatchSummary): boolean {
  return summary.failed > 0
}

export function batchSummaryAllFailed(summary: BatchSummary): boolean {
  return summary.total > 0 && summary.succeeded === 0
}

export interface BatchResult<T = void> {
  resources?: T[]
  failedRequests: Record<string, BatchRpcStatus>
  summary: BatchSummary
  code?: string
  message?: string
}

export interface BatchDeleteRequest {
  projectId: string
  names: string[]
  returnPartialSuccess?: boolean
  requestId?: string
}

export interface BatchUpdateManyRequest {
  projectId: string
  names: string[]
  updateMask: string[]
  returnPartialSuccess?: boolean
  requestId?: string
  /** Hoisted patch fields (storageClass, warehouseId, …). */
  fields?: Record<string, unknown>
}

export interface BatchCreateManyRequest {
  projectId: string
  items: Record<string, unknown>[]
  returnPartialSuccess?: boolean
  requestId?: string
}

export interface BatchReleaseRequest {
  projectId: string
  names: string[]
  returnPartialSuccess?: boolean
  requestId?: string
  toJson?(): Record<string, unknown>
}

export function parseBatchRpcStatus(json: Record<string, unknown>): BatchRpcStatus {
  return {
    code: (json.code as string) ?? 'UNKNOWN',
    message: (json.message as string) ?? 'Request failed',
    details: json.details,
  }
}

export function parseBatchSummary(json: Record<string, unknown>): BatchSummary {
  return {
    total: Number(json.total ?? 0),
    succeeded: Number(json.succeeded ?? 0),
    failed: Number(json.failed ?? 0),
  }
}

/**
 * Parses batch API response from success or 400 ABORTED body.
 */
export function parseBatchResult<T = void>(
  data: unknown,
  resourceFromJson?: (json: Record<string, unknown>) => T
): BatchResult<T> {
  const map = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const failedRaw = (map.failedRequests as Record<string, unknown>) ?? {}
  const failedRequests: Record<string, BatchRpcStatus> = {}
  for (const [key, value] of Object.entries(failedRaw)) {
    failedRequests[key] = parseBatchRpcStatus(
      (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
    )
  }

  let resources: T[] | undefined
  if (resourceFromJson && Array.isArray(map.resources)) {
    resources = map.resources.map((e) =>
      resourceFromJson((e && typeof e === 'object' ? e : {}) as Record<string, unknown>)
    )
  }

  return {
    resources,
    failedRequests,
    summary: parseBatchSummary(
      (map.summary && typeof map.summary === 'object' ? map.summary : {}) as Record<
        string,
        unknown
      >
    ),
    code: map.code as string | undefined,
    message: map.message as string | undefined,
  }
}

export function batchDeleteBody(request: BatchDeleteRequest): Record<string, unknown> {
  return {
    projectId: request.projectId,
    names: request.names,
    returnPartialSuccess: request.returnPartialSuccess ?? true,
    ...(request.requestId ? { requestId: request.requestId } : {}),
  }
}

export function batchUpdateManyBody(
  request: BatchUpdateManyRequest
): Record<string, unknown> {
  const { projectId, names, updateMask, returnPartialSuccess, requestId, fields } =
    request
  return {
    projectId,
    names,
    updateMask,
    ...(fields ?? {}),
    returnPartialSuccess: returnPartialSuccess ?? true,
    ...(requestId ? { requestId } : {}),
  }
}

export function batchReleaseBody(request: BatchReleaseRequest): Record<string, unknown> {
  if (request.toJson) return request.toJson()
  return {
    projectId: request.projectId,
    names: request.names,
    returnPartialSuccess: request.returnPartialSuccess ?? true,
    ...(request.requestId ? { requestId: request.requestId } : {}),
  }
}
