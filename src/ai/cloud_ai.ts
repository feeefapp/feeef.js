import type { AxiosInstance } from 'axios'
export type CloudImageCapabilities = {
  nativeGoogle: boolean
  aspectRatios: string[]
  sizes: string[]
  imageSizes: string[]
  quality: string[]
  background: string[]
  outputFormats: string[]
  customDimensions: {
    multipleOf: number
    maxEdge: number
    minPixels: number
    maxPixels: number
    maxAspectRatio: number
  } | null
  outputCompressionMax: number | null
  references: { maxImages: number; maxTotalBytes: number; formats: string[]; masks: boolean } | null
  maxImages: number
}
export type CloudAiModel = {
  id: string
  canonical_model?: string
  owned_by: string
  display?: { name?: string; description?: string }
  endpoints: string[]
  capabilities: Record<string, unknown>
  request_constraints: Record<string, unknown>
  pricing: { valid_until: string; version: string; [key: string]: unknown }
  feeef_image: CloudImageCapabilities | null
  [key: string]: unknown
}
export type CloudAiRequest = {
  id: string
  status: string
  cloudRequestId: string | null
  endpoint: string
  imageGenerationId: string | null
  billing: {
    currency: 'DZD'
    chargedMicros: string | null
    chargeDzd: string | null
    settled: boolean
  }
  error: { code?: string; message?: string } | null
  result: unknown
}
export type CloudImageSettings = {
  aspectRatio?: string
  size?: string
  imageSize?: string
  quality?: string
  background?: string
  outputFormat?: string
  outputCompression?: number
}
export function validateCloudImageSettings(model: CloudAiModel, settings: CloudImageSettings) {
  const caps = model.feeef_image
  if (
    !caps ||
    !Number.isFinite(Date.parse(model.pricing.valid_until)) ||
    Date.parse(model.pricing.valid_until) <= Date.now()
  )
    throw Error('Choose an available Cloud image model')
  const fields = {
    aspectRatio: 'aspectRatios',
    size: 'sizes',
    imageSize: 'imageSizes',
    quality: 'quality',
    background: 'background',
    outputFormat: 'outputFormats',
  } as const
  for (const [field, value] of Object.entries(settings)) {
    if (field === 'outputCompression') {
      if (
        !Number.isInteger(value) ||
        caps.outputCompressionMax === null ||
        Number(value) < 0 ||
        Number(value) > caps.outputCompressionMax ||
        !['jpeg', 'webp'].includes(settings.outputFormat ?? '')
      )
        throw Error('Compression requires JPEG or WebP')
    } else {
      const option = fields[field as keyof typeof fields]
      const advertised = option && typeof value === 'string' && caps[option].includes(value)
      const isPixelSize =
        field === 'size' && typeof value === 'string' && /^([1-9]\d*)x([1-9]\d*)$/.test(value)
      if (advertised && !(isPixelSize && caps.customDimensions)) continue
      const match =
        field === 'size' && typeof value === 'string' ? /^([1-9]\d*)x([1-9]\d*)$/.exec(value) : null
      const d = caps.customDimensions
      if (match && d) {
        const w = Number(match[1])
        const h = Number(match[2])
        if (
          !(w % d.multipleOf) &&
          !(h % d.multipleOf) &&
          Math.max(w, h) <= d.maxEdge &&
          w * h >= d.minPixels &&
          w * h <= d.maxPixels &&
          Math.max(w / h, h / w) <= d.maxAspectRatio
        )
          continue
      }
      throw Error(`Unsupported image option: ${field}`)
    }
  }
  if (
    settings.background === 'transparent' &&
    settings.outputFormat &&
    !['png', 'webp'].includes(settings.outputFormat)
  )
    throw Error('Transparency requires PNG or WebP')
}
/** Feeef-authenticated APIs; upstream credentials and tenant selection remain server-owned. */
export class CloudAiApi {
  constructor(readonly client: AxiosInstance) {}
  private validateKey(key: string) {
    if (!/^[\x21-\x7e]{1,200}$/.test(key))
      throw Error('Persist a stable Idempotency-Key before submission')
  }
  async models(storeId?: string): Promise<CloudAiModel[]> {
    const response = await this.client.get('/ai/models', {
      params: storeId ? { storeId } : {},
      headers: { 'Cache-Control': 'no-cache' },
    })
    return response.data.data
  }
  async submit(input: {
    endpoint: string
    body: Record<string, unknown>
    idempotencyKey: string
    storeId?: string
  }): Promise<CloudAiRequest> {
    this.validateKey(input.idempotencyKey)
    const { idempotencyKey, ...body } = input
    const response = await this.client.post('/ai/requests', body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    return response.data
  }
  async requests(idempotencyKey?: string): Promise<CloudAiRequest[]> {
    const response = await this.client.get('/ai/requests', {
      params: idempotencyKey ? { key: idempotencyKey } : {},
    })
    return response.data.data
  }
  async submitFile(input: {
    endpoint: string
    body: Record<string, unknown>
    file: Blob
    filename: string
    idempotencyKey: string
    storeId?: string
  }): Promise<CloudAiRequest> {
    this.validateKey(input.idempotencyKey)
    if (input.file.size > 19 * 1024 * 1024) throw Error('Upload exceeds 19 MiB')
    const form = new FormData()
    form.set('endpoint', input.endpoint)
    form.set('body', JSON.stringify(input.body))
    form.set('files', input.file, input.filename)
    if (input.storeId) form.set('storeId', input.storeId)
    const response = await this.client.post('/ai/requests', form, {
      headers: { 'Idempotency-Key': input.idempotencyKey },
    })
    return response.data
  }
  async stream(input: {
    endpoint: string
    body: Record<string, unknown>
    idempotencyKey: string
    storeId?: string
    signal?: AbortSignal
  }): Promise<{
    bytes: ReadableStream<Uint8Array>
    contentType: string
    jobId?: string
    status: number
  }> {
    this.validateKey(input.idempotencyKey)
    const response = await this.client.post<ReadableStream<Uint8Array>>(
      '/ai/streams',
      { endpoint: input.endpoint, body: { ...input.body, stream: true }, storeId: input.storeId },
      {
        adapter: 'fetch',
        responseType: 'stream',
        signal: input.signal,
        headers: { 'Idempotency-Key': input.idempotencyKey },
      }
    )
    return {
      bytes: response.data,
      contentType: String(response.headers['content-type'] ?? 'application/json'),
      jobId: response.headers['x-feeef-ai-job-id'],
      status: response.status,
    }
  }
  async prepareLiveSession(input: {
    model: string
    idempotencyKey: string
    storeId?: string
  }): Promise<CloudAiRequest> {
    return this.submit({
      endpoint: 'realtime',
      body: { model: input.model, type: 'transcription' },
      idempotencyKey: input.idempotencyKey,
      storeId: input.storeId,
    })
  }
  async content(id: string): Promise<ArrayBuffer> {
    const response = await this.client.get(`/ai/requests/${encodeURIComponent(id)}/content`, {
      responseType: 'arraybuffer',
    })
    return response.data
  }
  async request(id: string): Promise<CloudAiRequest> {
    const response = await this.client.get(`/ai/requests/${encodeURIComponent(id)}`)
    return response.data
  }
  async generateImage(input: {
    model: CloudAiModel
    prompt: string
    settings: CloudImageSettings
    idempotencyKey: string
    id?: string
    storeId?: string
    recoverOriginal?: boolean
    image?: Blob
    mask?: Blob
    attachments?: { type: string; value: string; label?: string; prompt?: string }[]
  }): Promise<Record<string, unknown>> {
    this.validateKey(input.idempotencyKey)
    validateCloudImageSettings(
      input.recoverOriginal
        ? {
            ...input.model,
            pricing: { ...input.model.pricing, valid_until: '9999-01-01T00:00:00Z' },
          }
        : input.model,
      input.settings
    )
    const refs = input.attachments?.filter((a) => a.type === 'image').length ?? 0
    const caps = input.model.feeef_image!
    if (
      refs + (input.image ? 1 : 0) > (caps.references?.maxImages ?? 0) ||
      (input.image?.size ?? 0) + (input.mask?.size ?? 0) > (caps.references?.maxTotalBytes ?? 0) ||
      (input.mask && !caps.references?.masks)
    )
      throw Error('References exceed model capabilities')
    if (input.mask && (input.mask.type !== 'image/png' || (!input.image && !refs)))
      throw Error('A PNG mask requires a reference image')
    const form = new FormData()
    form.set('model', input.model.id)
    form.set('prompt', input.prompt)
    form.set('options', JSON.stringify(input.settings))
    form.set('attachments', JSON.stringify(input.attachments ?? []))
    if (input.id) form.set('id', input.id)
    if (input.storeId) form.set('storeId', input.storeId)
    for (const [field, blob] of [
      ['imageFile', input.image],
      ['maskFile', input.mask],
    ] as const) {
      if (!blob) continue
      if (!caps.references?.formats.includes(blob.type)) throw Error('Unsupported reference format')
      form.set(
        field,
        blob,
        blob.type === 'image/png'
          ? 'reference.png'
          : blob.type === 'image/jpeg'
            ? 'reference.jpg'
            : 'reference.webp'
      )
    }
    const response = await this.client.post('/ai/images', form, {
      headers: { 'Idempotency-Key': input.idempotencyKey },
    })
    return response.data
  }
}
