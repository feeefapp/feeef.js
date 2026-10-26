import { test } from '@japa/runner'
import axios from 'axios'
import { FeeeF } from '../../src/feeef/feeef.js'

test.group('packages API contracts', () => {
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
        return { config, status: 200, statusText: 'OK', headers: {}, data: { version: 4 } }
      },
    })
    return {
      ff: new FeeeF({ apiKey: 'fixture', baseURL: 'https://example.test/v1', client }),
      calls,
    }
  }

  test('draft edits are compare-and-swap file changes; publish names the draft version', async ({
    assert,
  }) => {
    const { ff, calls } = fixture()
    await ff.packages.patchDraft('s 1', 'pkg', 3, [
      { path: 'components/hero.tsx', text: '' },
      { path: 'content/pages/old.json', text: null },
    ])
    await ff.packages.publish('s 1', 'pkg', { expectedDraftVersion: 4, activate: true })
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.url}`),
      ['patch /stores/s%201/packages/pkg/draft', 'post /stores/s%201/packages/pkg/publish']
    )
    assert.deepEqual(calls[0].data, {
      expectedVersion: 3,
      changes: [
        { path: 'components/hero.tsx', text: '' },
        { path: 'content/pages/old.json', text: null },
      ],
    })
    assert.deepEqual(calls[1].data, { expectedDraftVersion: 4, activate: true })
  })

  test('marketplace, install and store pages use the v3.1 routes', async ({ assert }) => {
    const { ff, calls } = fixture()
    await ff.packages.marketplace({ kind: 'component', q: 'reviews' })
    await ff.packages.install('s', { packageId: 'p', expectedPrice: 0 })
    await ff.packages.live('s')
    await ff.packages.updatePage('s', 'pg', {
      expectedVersion: 2,
      title: 'Sale',
      content: { slots: { main: [{ id: 'h', use: 'hero' }] } },
    })
    await ff.packages.resolvePage('s', '/pages/sale')
    assert.deepEqual(
      calls.map((c) => `${c.method} ${c.url}`),
      [
        'get /packages',
        'post /stores/s/packages/install',
        'get /stores/s/template',
        'patch /stores/s/pages/pg',
        'get /stores/s/pages/resolve',
      ]
    )
    assert.deepEqual(calls[0].params, { kind: 'component', q: 'reviews' })
    assert.deepEqual(calls[3].data, {
      expectedVersion: 2,
      title: 'Sale',
      content: { slots: { main: [{ id: 'h', use: 'hero' }] } },
    })
    assert.deepEqual(calls[4].params, { path: '/pages/sale' })
  })
})
