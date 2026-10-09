import { test } from '@japa/runner'
import {
  generatePublicStoreIntegrationMetaPixel,
  generatePublicStoreIntegrationSnapchatPixel,
  generatePublicStoreIntegrationTiktokPixel,
} from '../../src/core/entities/store.js'

test.group('public pixel entries: capi flag, never the secret', () => {
  test('Meta: capi = a non-empty key is set', ({ assert }) => {
    const out = generatePublicStoreIntegrationMetaPixel({
      active: true,
      mode: 'auto',
      pixels: [{ id: 'm1', key: 'EAA-very-secret' }, { id: 'm2', key: '   ' }, { id: 'm3' }],
    } as any)
    assert.deepEqual(out?.pixels, [
      { id: 'm1', capi: true },
      { id: 'm2', capi: false },
      { id: 'm3', capi: false },
    ])
    assert.notInclude(JSON.stringify(out), 'very-secret')
  })

  test('TikTok and Snap: capi = a non-empty access token is set', ({ assert }) => {
    const tt = generatePublicStoreIntegrationTiktokPixel({
      active: true,
      pixels: [{ id: 't1', accessToken: 'tt-secret' }, { id: 't2' }],
    } as any)
    const snap = generatePublicStoreIntegrationSnapchatPixel({
      active: true,
      pixels: [
        { id: 's1', accessToken: 'snap-secret' },
        { id: 's2', accessToken: '' },
      ],
    } as any)
    assert.deepEqual(tt?.pixels, [
      { id: 't1', capi: true },
      { id: 't2', capi: false },
    ])
    assert.deepEqual(snap?.pixels, [
      { id: 's1', capi: true },
      { id: 's2', capi: false },
    ])
    assert.notInclude(JSON.stringify([tt, snap]), 'secret')
  })
})
