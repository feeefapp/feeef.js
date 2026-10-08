/**
 * Public projection for store.integrations.security — storefront-safe subset only.
 */
import { test } from '@japa/runner'
import {
  generatePublicStoreIntegrationSecurity,
  SecurityTreatment,
} from '../../src/core/entities/store.js'

test.group('generatePublicStoreIntegrationSecurity', () => {
  test('returns null when security is absent', ({ assert }) => {
    assert.isNull(generatePublicStoreIntegrationSecurity(null))
    assert.isNull(generatePublicStoreIntegrationSecurity(undefined))
  })

  test('exposes frontend / doubleSend / minTime only', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: true,
      options: {
        frontend: { active: true, ttl: 3600, treatment: SecurityTreatment.block },
        doubleSend: { active: true, ttl: 300, treatment: SecurityTreatment.fake },
        minTimeInPage: { active: true, duration: 10, treatment: SecurityTreatment.warning },
        // Server-only — must not appear on public payload
        countries: {
          active: true,
          treatment: SecurityTreatment.block,
          allowed: ['DZ'],
          blocked: ['FR'],
        },
        sources: {
          active: true,
          treatment: SecurityTreatment.fake,
          allowed: ['ads'],
          blocked: ['organic'],
        },
        ip: { active: true, ttl: 86400, treatment: SecurityTreatment.block },
        phone: { active: true, ttl: 86400, treatment: SecurityTreatment.block },
        fingerprint: { active: true, ttl: 3600, treatment: SecurityTreatment.block },
        ads: { active: true, ttl: 604800, treatment: SecurityTreatment.block },
      },
    })

    assert.isTrue(pub?.active === true)
    assert.exists(pub?.options.frontend)
    assert.exists(pub?.options.doubleSend)
    assert.exists(pub?.options.minTimeInPage)
    assert.notProperty(pub?.options as object, 'countries')
    assert.notProperty(pub?.options as object, 'sources')
    assert.notProperty(pub?.options as object, 'ip')
    assert.notProperty(pub?.options as object, 'phone')
    assert.notProperty(pub?.options as object, 'fingerprint')
    assert.notProperty(pub?.options as object, 'ads')
    assert.equal(pub?.options.doubleSend?.ttl, 300)
    assert.deepEqual(Object.keys(pub?.options ?? {}).sort(), [
      'doubleSend',
      'frontend',
      'minTimeInPage',
    ])
  })

  test('never leaks country / source lists or treatments anywhere in the payload', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: true,
      options: {
        frontend: { active: true, ttl: 60, treatment: SecurityTreatment.block },
        countries: {
          active: true,
          treatment: SecurityTreatment.warning,
          allowed: ['ZZ-ALLOWED-COUNTRY'],
          blocked: ['ZZ-BLOCKED-COUNTRY'],
        },
        sources: {
          active: true,
          treatment: SecurityTreatment.fake,
          allowed: ['zz-allowed-source'],
          blocked: ['zz-blocked-source'],
        },
      },
    })
    const json = JSON.stringify(pub)
    for (const leaked of [
      'ZZ-ALLOWED-COUNTRY',
      'ZZ-BLOCKED-COUNTRY',
      'zz-allowed-source',
      'zz-blocked-source',
      'countries',
      'sources',
      'allowed',
      'blocked',
      'warning',
      'fake',
    ]) {
      assert.notInclude(json, leaked)
    }
    assert.deepEqual(pub, {
      active: true,
      options: { frontend: { active: true, ttl: 60, treatment: SecurityTreatment.block } },
    })
  })

  test('countries / sources only config publishes empty options', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: true,
      options: {
        countries: { active: true, treatment: SecurityTreatment.block, allowed: null, blocked: [] },
        sources: { active: false, treatment: SecurityTreatment.block, allowed: null, blocked: [] },
      },
    })
    assert.deepEqual(pub, { active: true, options: {} })
  })

  test('omits incomplete option blocks', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: false,
      options: {
        // missing treatment → stripped
        frontend: { active: true, ttl: 1 } as any,
      },
    })
    assert.equal(pub?.active, false)
    assert.notProperty(pub?.options as object, 'frontend')
  })
})
