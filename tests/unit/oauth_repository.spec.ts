import { test } from '@japa/runner'
import { OAuthRepository, OAuthIntrospectResponse } from '../../src/feeef/repositories/oauth.js'

test.group('OAuthRepository.buildAuthorizeUrl', () => {
  test('builds URL with required params', ({ assert }) => {
    const url = OAuthRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.feeef.org/v1',
      clientId: 'client_abc',
      redirectUri: 'https://myapp.com/callback',
    })
    assert.include(url, 'https://api.feeef.org/v1/oauth/authorize')
    assert.include(url, 'client_id=client_abc')
    assert.include(url, 'redirect_uri=')
    assert.include(url, 'response_type=code')
  })

  test('includes optional scope, state and PKCE', ({ assert }) => {
    const url = OAuthRepository.buildAuthorizeUrl({
      baseUrl: 'https://api.example.com/v1',
      clientId: 'c1',
      redirectUri: 'https://app.com/cb',
      scope: ['stores:read', 'orders:write'],
      state: 'state_123',
      codeChallenge: 'challenge_xyz',
      codeChallengeMethod: 'S256',
    })
    assert.include(url, 'scope=')
    assert.include(url, 'state=state_123')
    assert.include(url, 'code_challenge=challenge_xyz')
    assert.include(url, 'code_challenge_method=S256')
  })
})

test.group('OAuthRepository response typing', () => {
  test('introspect response type shape is accepted', ({ assert }) => {
    const response: OAuthIntrospectResponse = {
      active: true,
      scope: 'stores:read',
      client_id: 'client_1',
      username: null,
      token_type: 'Bearer',
      exp: 123,
    }

    assert.equal(response.active, true)
    assert.equal(response.token_type, 'Bearer')
  })
})
