import { test } from '@japa/runner'
import {
  DEFAULT_OAUTH_SCOPES,
  MEMBER_SCOPES,
  OAUTH_PLATFORM_SCOPES,
  OAUTH_SCOPES,
} from '../../src/core/oauth_scopes.js'

test.group('feeef.js OAuth scope catalog', () => {
  test('member catalog includes integrations, templates, finance, inventory', ({ assert }) => {
    assert.includeMembers(
      [...MEMBER_SCOPES],
      ['store.integrations', 'store_templates', 'template_components', 'finance', 'inventory']
    )
  })

  test('OAUTH_SCOPES is member + platform, identity default is auth only', ({ assert }) => {
    assert.includeMembers([...OAUTH_SCOPES], [...MEMBER_SCOPES, ...OAUTH_PLATFORM_SCOPES])
    assert.deepEqual([...DEFAULT_OAUTH_SCOPES], ['auth'])
    assert.notInclude(DEFAULT_OAUTH_SCOPES as unknown as string[], '*')
  })
})
