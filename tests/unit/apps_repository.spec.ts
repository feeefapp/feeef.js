/**
 * Unit tests for AppRepository (developer-registered apps).
 *
 * @see src/feeef/repositories/apps.ts
 */

import { test } from '@japa/runner'
import {
  AppRepository,
  type AppCreateInput,
  type AppEntity,
  type AppUpdateInput,
} from '../../src/feeef/repositories/apps.js'

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

test.group('AppRepository.logoUrl typing', () => {
  test('supports logoUrl on app entity and create/update payloads', ({ assert }) => {
    const createPayload: AppCreateInput = {
      name: 'My app',
      logoUrl: 'https://cdn.example.com/logo.png',
      redirectUris: ['https://example.com/cb'],
      scopes: ['auth'],
    }
    const updatePayload: AppUpdateInput = {
      logoUrl: null,
    }
    const app: AppEntity = {
      id: 'app_1',
      userId: 'user_1',
      name: 'My app',
      logoUrl: 'https://cdn.example.com/logo.png',
      clientId: 'client_1',
      redirectUris: ['https://example.com/cb'],
      scopes: ['auth'],
      active: true,
      lastUsedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
    }

    assert.equal(createPayload.logoUrl, 'https://cdn.example.com/logo.png')
    assert.isNull(updatePayload.logoUrl)
    assert.equal(app.logoUrl, 'https://cdn.example.com/logo.png')
  })
})
