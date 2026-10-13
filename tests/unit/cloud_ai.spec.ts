import { test } from '@japa/runner'
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { CloudAiApi, validateCloudImageSettings, type CloudAiModel } from '../../src/ai/cloud_ai.js'
const model: CloudAiModel = {
  id: 'openai/gpt-image-2',
  owned_by: 'openai',
  endpoints: ['images/generations'],
  capabilities: {},
  request_constraints: {},
  pricing: { version: 'fixture', valid_until: '2099-01-01T00:00:00Z' },
  feeef_image: {
    nativeGoogle: false,
    aspectRatios: [],
    sizes: ['auto', '864x3072', '512x4096'],
    imageSizes: [],
    quality: ['high'],
    background: ['transparent', 'opaque'],
    outputFormats: ['png', 'jpeg', 'webp'],
    outputCompressionMax: 100,
    customDimensions: {
      multipleOf: 16,
      maxEdge: 3840,
      minPixels: 655360,
      maxPixels: 8294400,
      maxAspectRatio: 32 / 9,
    },
    references: { maxImages: 1, maxTotalBytes: 1024, formats: ['image/png'], masks: true },
    maxImages: 1,
  },
}
test.group('Cloud AI', () => {
  test('advertised sizes still obey route bounds and unsupported combinations are rejected', ({
    assert,
  }) => {
    validateCloudImageSettings(model, {
      size: '864x3072',
      background: 'transparent',
      outputFormat: 'png',
    })
    for (const options of [
      { size: '512x4096' },
      { aspectRatio: '1:8' },
      { background: 'transparent', outputFormat: 'jpeg' },
      { outputFormat: 'png', outputCompression: 50 },
      { quality: 4 },
    ])
      assert.throws(() => validateCloudImageSettings(model, options as any))
  })
  test('retries keep caller identity, preserve opaque JSON and exact billing strings', async ({
    assert,
  }) => {
    const calls: InternalAxiosRequestConfig[] = []
    const client = axios.create({
      adapter: async (config) => {
        calls.push(config)
        return {
          data: {
            id: 'job',
            status: 'succeeded',
            billing: { currency: 'DZD', chargedMicros: '6325', chargeDzd: '4.112', settled: true },
          },
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config,
        }
      },
    })
    const api = new CloudAiApi(client)
    for (let i = 0; i < 2; i++) {
      const job = await api.submit({
        endpoint: 'chat/completions',
        body: { model: 'provider/model', prompt: '' },
        idempotencyKey: 'persisted',
      })
      assert.strictEqual(job.billing.chargeDzd, '4.112')
    }
    assert.deepEqual(
      calls.map((c) => c.headers['Idempotency-Key']),
      ['persisted', 'persisted']
    )
    assert.strictEqual(JSON.parse(calls[0].data).body.prompt, '')
    await assert.rejects(() => api.submit({ endpoint: 'responses', body: {}, idempotencyKey: '' }))
    assert.lengthOf(calls, 2)
  })
  test('invalid image options and unsupported upload formats never make an HTTP request', async ({
    assert,
  }) => {
    let calls = 0
    const api = new CloudAiApi(
      axios.create({
        adapter: async () => {
          calls++
          throw Error('unexpected HTTP')
        },
      })
    )
    await assert.rejects(() =>
      api.generateImage({
        model,
        prompt: 'hello',
        settings: { quality: 'max' },
        idempotencyKey: 'key',
      })
    )
    await assert.rejects(() =>
      api.generateImage({
        model,
        prompt: 'hello',
        settings: {},
        idempotencyKey: 'key',
        image: new Blob(['image'], { type: 'image/gif' }),
      })
    )
    assert.strictEqual(calls, 0)
  })
})
