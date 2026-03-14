/**
 * Unit tests for AppRepository (developer-registered apps).
 *
 * @see src/feeef/repositories/apps.ts
 */

import { test } from '@japa/runner'
import { AppRepository } from '../../src/feeef/repositories/apps.js'

test.group('AppRepository.buildAuthorizeUrl', () => {
  test('builds URL with required params', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.feeef.org/api/v1',
      clientId: 'client_abc',
      redirectUri: 'https://myapp.com/callback',
      responseType: 'code',
    })
    assert.include(url, 'https://api.feeef.org/api/v1/oauth/authorize')
    assert.include(url, 'client_id=client_abc')
    assert.include(url, 'redirect_uri=')
    assert.include(url, 'response_type=code')
  })

  test('includes scope when provided', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com/v1',
      clientId: 'c1',
      redirectUri: 'https://app.com/cb',
      responseType: 'code',
      scope: ['auth', 'stores'],
    })
    assert.include(url, 'scope=')
    assert.include(url, 'auth')
    assert.include(url, 'stores')
  })

  test('includes state when provided', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com/v1',
      clientId: 'c1',
      redirectUri: 'https://app.com/cb',
      responseType: 'code',
      state: 'random_state_123',
    })
    assert.include(url, 'state=random_state_123')
  })

  test('includes code_challenge and code_challenge_method when provided', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com/v1',
      clientId: 'c1',
      redirectUri: 'https://app.com/cb',
      responseType: 'code',
      codeChallenge: 'challenge_xyz',
      codeChallengeMethod: 'S256',
    })
    assert.include(url, 'code_challenge=challenge_xyz')
    assert.include(url, 'code_challenge_method=S256')
  })

  test('handles baseUrl with trailing slash', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com/v1/',
      clientId: 'c1',
      redirectUri: 'https://app.com/cb',
      responseType: 'code',
    })
    assert.include(url, 'oauth/authorize')
    assert.include(url, 'client_id=c1')
  })

  test('encodes redirect_uri', ({ assert }) => {
    const url = AppRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com',
      clientId: 'c1',
      redirectUri: 'https://myapp.com/callback?foo=bar',
      responseType: 'code',
    })
    assert.include(url, 'redirect_uri=')
    assert.include(url, encodeURIComponent('https://myapp.com/callback?foo=bar'))
  })
})
