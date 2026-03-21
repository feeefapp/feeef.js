import { test } from '@japa/runner'
import { transmitRootFromApiBaseUrl } from '../../src/realtime/transmit.js'

test.group('transmitRootFromApiBaseUrl', () => {
  test('strips /v1 suffix', ({ assert }) => {
    assert.equal(transmitRootFromApiBaseUrl('https://api.feeef.org/v1'), 'https://api.feeef.org')
  })

  test('strips /api/v1 suffix', ({ assert }) => {
    assert.equal(
      transmitRootFromApiBaseUrl('http://localhost:3333/api/v1'),
      'http://localhost:3333'
    )
  })

  test('trims trailing slashes before stripping', ({ assert }) => {
    assert.equal(transmitRootFromApiBaseUrl('https://api.feeef.org/v1///'), 'https://api.feeef.org')
  })

  test('leaves bare origin when no known suffix', ({ assert }) => {
    assert.equal(transmitRootFromApiBaseUrl('https://api.feeef.org'), 'https://api.feeef.org')
  })
})
