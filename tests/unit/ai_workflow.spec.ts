import { test } from '@japa/runner'
import axios from 'axios'
import { FeeeF } from '../../src/feeef/feeef.js'
test.group('AI workflow identity', () => {
  test('concurrent actions keep separate caller keys and do not mutate shared headers', async ({
    assert,
  }) => {
    const keys: unknown[] = []
    const client = axios.create({
      adapter: async (config) => {
        keys.push(config.headers.get('Idempotency-Key'))
        return { config, data: { success: true }, status: 200, statusText: 'OK', headers: {} }
      },
    })
    const feeef = new FeeeF({ apiKey: 'fixture', baseURL: 'https://feeef.test/v1', client })
    await Promise.all(
      ['first-persisted-key', 'second-persisted-key'].map((key) =>
        feeef.withAiWorkflow(key, (scoped) =>
          scoped.client.post('/actions/generateSimpleCode', { input: 'hello' })
        )
      )
    )
    assert.sameMembers(keys, ['first-persisted-key', 'second-persisted-key'])
    assert.isUndefined(feeef.client.defaults.headers.common['Idempotency-Key'])
    await assert.rejects(
      () => feeef.withAiWorkflow('', async () => {}),
      /Persist an AI workflow key/
    )
  })
})
