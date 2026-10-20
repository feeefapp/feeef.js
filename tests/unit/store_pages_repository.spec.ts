import { test } from '@japa/runner'
import axios from 'axios'
import { FeeeF } from '../../src/feeef/feeef.js'

test.group('website API contracts', () => {
  function fixture() {
    const calls: Array<{ method: string; url: string; params: unknown; data: any }> = []
    const client = axios.create({
      adapter: async (config) => {
        calls.push({
          method: config.method!,
          url: config.url!,
          params: config.params,
          data: typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
        })
        return {
          config,
          status: 200,
          statusText: 'OK',
          headers: {},
          data: { id: 'page-1', revision: 'revision-1' },
        }
      },
    })
    return {
      ff: new FeeeF({ apiKey: 'fixture', baseURL: 'https://example.test/v1', client }),
      calls,
    }
  }
  test('page clone keeps omission and explicit null distinct and sends the original revision', async ({
    assert,
  }) => {
    const { ff, calls } = fixture()
    await ff.storePages.create('store-1', { path: '/pages/clone', createdFromPage: 'native-page' })
    await ff.storePages.update('store-1', 'page-1', {
      expectedRevision: 3,
      root: null,
      title: null,
      sections: {},
    })
    assert.deepEqual(calls[0].data, { path: '/pages/clone', createdFromPage: 'native-page' })
    assert.deepEqual(calls[1].data, { expectedRevision: 3, root: null, title: null, sections: {} })
    assert.equal(calls.length, 2)
  })
  test('bulk and preview name exact page revisions and stable operation identity', async ({
    assert,
  }) => {
    const { ff, calls } = fixture()
    await ff.storePages.bulk(
      'store-1',
      'duplicate',
      [{ id: 'p1', expectedRevision: 7 }],
      'operation-1'
    )
    await ff.storePages.preview('store-1', 'p1', 7)
    assert.equal(calls[0].url, '/stores/store-1/pages/bulk')
    assert.deepEqual(calls[0].data, {
      action: 'duplicate',
      items: [{ id: 'p1', expectedRevision: 7 }],
      operationId: 'operation-1',
    })
    assert.deepEqual(calls[1].data, { expectedRevision: 7 })
  })
  test('install and purchase preserve the reviewed price and replacement preconditions', async ({
    assert,
  }) => {
    const { ff, calls } = fixture()
    await ff.storeTemplates.install({
      fromId: 'template-1',
      storeId: 'store-1',
      releaseId: 'release-1',
      expectedTemplateRevision: 'old-revision',
      confirmReplace: true,
    })
    await ff.storeTemplates.purchase({
      fromId: 'template-1',
      storeId: 'store-1',
      expectedPrice: 500,
      expectedCurrency: 'DZD',
    })
    assert.deepEqual(calls[0].data, {
      storeId: 'store-1',
      releaseId: 'release-1',
      expectedTemplateRevision: 'old-revision',
      confirmReplace: true,
    })
    assert.deepEqual(calls[1].data, {
      storeId: 'store-1',
      expectedPrice: 500,
      expectedCurrency: 'DZD',
    })
  })
  test('template restore is store scoped and guarded by the displayed revision', async ({
    assert,
  }) => {
    const { ff, calls } = fixture()
    await ff.storeTemplates.restoreTemplate('store-1', 'backup-1', 'current-revision')
    assert.equal(calls[0].url, '/stores/store-1/template/backups/backup-1/restore')
    assert.deepEqual(calls[0].data, { expectedRevision: 'current-revision' })
  })
})
