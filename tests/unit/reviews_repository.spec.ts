/**
 * Product reviews SDK — request shapes sent by `ff.reviews` (no network: axios adapter).
 * Protects: public + review-page + merchant paths, idempotency on paid AI calls, and the
 * store-level public switches that storefronts read.
 */
import { test } from '@japa/runner'
import axios from 'axios'
import { FeeeF } from '../../src/feeef/feeef.js'
import { generatePublicStoreIntegrationReviews } from '../../src/core/entities/store.js'

function recorder(response: unknown = { data: [] }) {
  const calls: {
    method: string
    url: string
    params?: unknown
    body?: unknown
    headers: Record<string, string>
  }[] = []
  const client = axios.create({
    adapter: async (config) => {
      const headers: Record<string, string> = {}
      for (const [k, v] of Object.entries(config.headers?.toJSON?.() ?? {})) {
        if (typeof v === 'string') headers[k] = v
      }
      calls.push({
        method: String(config.method).toUpperCase(),
        url: String(config.url),
        params: config.params,
        body:
          typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data,
        headers,
      })
      return { config, data: response, status: 200, statusText: 'OK', headers: {} }
    },
  })
  const feeef = new FeeeF({ apiKey: 'fixture', baseURL: 'https://feeef.test/v1', client })
  return { feeef, calls }
}

test.group('ff.reviews — shopper calls', () => {
  test('list sends the verified-only filter and the sort as query params', async ({ assert }) => {
    const { feeef, calls } = recorder({ data: [], meta: {}, summary: {}, settings: {} })
    await feeef.reviews.list('prod_1', { verifiedOnly: true, sort: 'rating_desc', limit: 5 })
    assert.equal(calls[0].method, 'GET')
    assert.equal(calls[0].url, '/products/prod_1/reviews')
    assert.deepEqual(calls[0].params, { verifiedOnly: true, sort: 'rating_desc', limit: 5 })
  })

  test('review page: request and submit use the token path, submit sends anonymous', async ({
    assert,
  }) => {
    const { feeef, calls } = recorder({ items: [] })
    await feeef.reviews.request('rv_abc.def')
    await feeef.reviews.submit('rv_abc.def', {
      items: [{ productId: 'p1', rating: 4, body: 'Nice' }],
      anonymous: true,
    })
    assert.equal(calls[0].url, '/reviews/requests/rv_abc.def')
    assert.equal(calls[1].method, 'PUT')
    assert.deepEqual(calls[1].body, {
      items: [{ productId: 'p1', rating: 4, body: 'Nice' }],
      anonymous: true,
    })
  })

  test('storefront create posts to the product', async ({ assert }) => {
    const { feeef, calls } = recorder({ id: 'r1', status: 'pending' })
    const result = await feeef.reviews.create('p1', { rating: 3, name: 'Walid' })
    assert.equal(calls[0].url, '/products/p1/reviews')
    assert.equal(result.status, 'pending')
  })
})

test.group('ff.reviews — merchant and AI calls', () => {
  test('merchant routes are scoped to the store', async ({ assert }) => {
    const { feeef, calls } = recorder({ updated: 2 })
    await feeef.reviews.listForStore('s1', { status: 'pending' })
    await feeef.reviews.bulk('s1', { ids: ['a', 'b'], status: 'published' })
    await feeef.reviews.moderate('s1', 'r9', { reply: null })
    await feeef.reviews.reviewLink('s1', 'o7')
    await feeef.reviews.markRequestSent('s1', 'o7')
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.url}`),
      [
        'GET /stores/s1/reviews',
        'POST /stores/s1/reviews/bulk',
        'PATCH /stores/s1/reviews/r9',
        'GET /stores/s1/orders/o7/review-link',
        'POST /stores/s1/orders/o7/review-link/sent',
      ]
    )
    assert.deepEqual(calls[2].body, { reply: null })
  })

  test('paid AI calls carry the caller-persisted idempotency key', async ({ assert }) => {
    const { feeef, calls } = recorder({ success: true, reply: 'Thanks!' })
    await feeef.reviews.draftReply(
      { storeId: 's1', reviewId: 'r1', tone: 'short' },
      'reply-key-0001'
    )
    await feeef.reviews.summarize({ storeId: 's1', productId: 'p1' }, 'summary-key-0001')
    assert.equal(calls[0].url, '/ai/text/review-reply')
    assert.equal(
      calls[0].headers['idempotency-key'] ?? calls[0].headers['Idempotency-Key'],
      'reply-key-0001'
    )
    assert.equal(calls[1].url, '/ai/text/review-summary')
    assert.equal(
      calls[1].headers['idempotency-key'] ?? calls[1].headers['Idempotency-Key'],
      'summary-key-0001'
    )
  })
})

test.group('store public review switches', () => {
  test('no settings means reviews are on and the form stays off', ({ assert }) => {
    assert.deepEqual(generatePublicStoreIntegrationReviews(undefined), {
      active: true,
      storefrontForm: false,
    })
  })

  test('turning reviews off also closes the storefront form', ({ assert }) => {
    assert.deepEqual(
      generatePublicStoreIntegrationReviews({ active: false, storefrontForm: true }),
      {
        active: false,
        storefrontForm: false,
      }
    )
    assert.deepEqual(generatePublicStoreIntegrationReviews({ storefrontForm: true }), {
      active: true,
      storefrontForm: true,
    })
  })
})
