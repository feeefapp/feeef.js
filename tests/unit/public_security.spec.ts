/**
 * Public projection for store.integrations.security: numeric knobs only.
 */
import { test } from '@japa/runner'
import {
  generatePublicStoreIntegrationSecurity,
  SecurityTreatment,
} from '../../src/core/entities/store.js'
import * as sdk from '../../src/index.js'

const fullConfig = {
  active: true,
  options: {
    frontend: { active: true, ttl: 3600, treatment: SecurityTreatment.block },
    doubleSend: { active: true, ttl: 30, treatment: SecurityTreatment.fake },
    minTimeInPage: { active: true, duration: 10, treatment: SecurityTreatment.warning },
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
    ip: { active: true, ttl: 86400, treatment: SecurityTreatment.block },
    phone: { active: true, ttl: 86400, treatment: SecurityTreatment.block },
    fingerprint: { active: true, ttl: 3600, treatment: SecurityTreatment.block },
    ads: { active: true, ttl: 604800, treatment: SecurityTreatment.block },
  },
}

test.group('generatePublicStoreIntegrationSecurity', () => {
  test('null when security is absent or off', ({ assert }) => {
    assert.isNull(generatePublicStoreIntegrationSecurity(null))
    assert.isNull(generatePublicStoreIntegrationSecurity(undefined))
    assert.isNull(generatePublicStoreIntegrationSecurity({ ...fullConfig, active: false }))
  })

  test('exactly three numeric knobs, in milliseconds', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity(fullConfig)
    assert.deepEqual(pub, {
      minTimeMs: 10_000,
      duplicateWindowMs: 3_600_000,
      submitCooldownMs: 30_000,
    })
    for (const v of Object.values(pub!)) assert.isNumber(v)
  })

  test('no outcome names, rule names or lists anywhere in the payload', ({ assert }) => {
    const json = JSON.stringify(generatePublicStoreIntegrationSecurity(fullConfig))
    for (const leaked of [
      'ZZ-ALLOWED-COUNTRY',
      'ZZ-BLOCKED-COUNTRY',
      'zz-allowed-source',
      'zz-blocked-source',
      'countries',
      'sources',
      'allowed',
      'blocked',
      'block',
      'warning',
      'fake',
      'treatment',
      'options',
      'frontend',
      'doubleSend',
      'minTimeInPage',
      'active',
      'ttl',
      'duration',
    ]) {
      assert.notInclude(json, leaked)
    }
  })

  test('inactive rules publish 0; defaults when a TTL is missing', ({ assert }) => {
    assert.deepEqual(
      generatePublicStoreIntegrationSecurity({
        active: true,
        options: {
          frontend: { active: true, treatment: SecurityTreatment.block },
          doubleSend: { active: true, ttl: null, treatment: SecurityTreatment.block },
          minTimeInPage: { active: false, duration: 10, treatment: SecurityTreatment.block },
        },
      }),
      { minTimeMs: 0, duplicateWindowMs: 3_600_000, submitCooldownMs: 3_000 }
    )
    assert.deepEqual(generatePublicStoreIntegrationSecurity({ active: true, options: null }), {
      minTimeMs: 0,
      duplicateWindowMs: 0,
      submitCooldownMs: 0,
    })
  })

  test('the in-flight cooldown is capped (the server window is not published)', ({ assert }) => {
    const pub = generatePublicStoreIntegrationSecurity({
      active: true,
      options: { doubleSend: { active: true, ttl: 86400, treatment: SecurityTreatment.block } },
    })
    assert.equal(pub?.submitCooldownMs, 60_000)
  })
})

test.group('order helpers', () => {
  test('no id-based order classification helpers are exported', ({ assert }) => {
    for (const name of [
      'isFakeOrderId',
      'isFakeOrder',
      'isWarningOrder',
      'shouldSuppressPixelEvents',
    ]) {
      assert.notProperty(sdk, name)
    }
  })
})
