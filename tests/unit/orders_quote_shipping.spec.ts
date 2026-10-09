/**
 * OrderRepository.calculate / quoteShipping: request body and result shape.
 *
 * @see src/feeef/repositories/orders.ts
 */

import { test } from '@japa/runner'
import type { AxiosInstance } from 'axios'
import { ShippingType } from '../../src/core/entities/order.js'
import { OrderRepository } from '../../src/feeef/repositories/orders.js'

function fakeClient(shippingPrice: unknown) {
  const calls: Array<{ url: string; body: any }> = []
  const client = {
    post: async (url: string, body: any) => {
      calls.push({ url, body })
      return { data: { pricing: { subtotal: 1000, shippingPrice, calculatedTotal: 1000 } } }
    },
  } as unknown as AxiosInstance
  return { client, calls }
}

const items = [{ productId: 'p1', quantity: 1 }]

test.group('OrderRepository.quoteShipping', () => {
  test('posts to /orders/calculate with wilaya, commune and type', async ({ assert }) => {
    const { client, calls } = fakeClient(650)
    const repo = new OrderRepository(client)
    const quote = await repo.quoteShipping({
      storeId: 's1',
      items,
      shippingState: '16',
      shippingCity: 'Bab Ezzouar',
      shippingType: ShippingType.pickup,
    })
    assert.deepEqual(quote, { shippingPrice: 650 })
    assert.lengthOf(calls, 1)
    assert.equal(calls[0].url, '/orders/calculate')
    assert.equal(calls[0].body.storeId, 's1')
    assert.equal(calls[0].body.shippingState, '16')
    assert.equal(calls[0].body.shippingCity, 'Bab Ezzouar')
    assert.equal(calls[0].body.shippingType, 'pickup')
    assert.equal(calls[0].body.items[0].productId, 'p1')
  })

  test('null, negative or non-numeric prices become null; 0 stays free', async ({ assert }) => {
    for (const [raw, expected] of [
      [null, null],
      [undefined, null],
      ['abc', null],
      [-5, null],
      [0, 0],
      ['400', 400],
    ] as const) {
      const repo = new OrderRepository(fakeClient(raw).client)
      const quote = await repo.quoteShipping({ storeId: 's1', items, shippingState: '16' })
      assert.strictEqual(quote.shippingPrice, expected, String(raw))
    }
  })

  test('no wilaya, store or items: no request, null price', async ({ assert }) => {
    const { client, calls } = fakeClient(500)
    const repo = new OrderRepository(client)
    assert.deepEqual(await repo.quoteShipping({ storeId: 's1', items, shippingState: '' }), { shippingPrice: null })
    assert.deepEqual(await repo.quoteShipping({ storeId: '', items, shippingState: '16' }), { shippingPrice: null })
    assert.deepEqual(await repo.quoteShipping({ storeId: 's1', items: [], shippingState: '16' }), { shippingPrice: null })
    assert.lengthOf(calls, 0)
  })

  test('calculate forwards shippingCity and omits it when empty', async ({ assert }) => {
    const { client, calls } = fakeClient(300)
    const repo = new OrderRepository(client)
    await repo.calculate({ storeId: 's1', items, shippingState: '31', shippingCity: 'Oran' })
    await repo.calculate({ storeId: 's1', items, shippingState: '31', shippingCity: '' })
    assert.equal(calls[0].body.shippingCity, 'Oran')
    assert.isUndefined(calls[1].body.shippingCity)
  })
})
