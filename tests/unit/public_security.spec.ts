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

  test('exposes frontend / doubleSend / minTime / countries / sources only', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: true,
      options: {
        frontend: { active: true, ttl: 3600, treatment: SecurityTreatment.block },
        doubleSend: { active: true, ttl: 300, treatment: SecurityTreatment.fake },
        minTimeInPage: { active: true, duration: 10, treatment: SecurityTreatment.warning },
        countries: {
          active: true,
          treatment: SecurityTreatment.block,
          allowed: ['DZ'],
          blocked: [],
        },
        sources: {
          active: true,
          treatment: SecurityTreatment.block,
          allowed: ['ads'],
          blocked: [],
        },
        // Server-only — must not appear on public payload
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
    assert.exists(pub?.options.countries)
    assert.exists(pub?.options.sources)
    assert.notProperty(pub?.options as object, 'ip')
    assert.notProperty(pub?.options as object, 'phone')
    assert.notProperty(pub?.options as object, 'fingerprint')
    assert.notProperty(pub?.options as object, 'ads')
    assert.equal(pub?.options.doubleSend?.ttl, 300)
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
