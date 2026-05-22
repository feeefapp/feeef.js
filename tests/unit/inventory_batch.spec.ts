/**
 * Unit tests for batch parsing and inventory batch request builders.
 */

import { test } from '@japa/runner'
import {
  parseBatchResult,
  batchDeleteBody,
  batchUpdateManyBody,
} from '../../src/core/batch.js'
import { InventoryBatchUpdateObjectsRequest } from '../../src/feeef/repositories/inventory.js'

test.group('parseBatchResult', () => {
  test('parses partial success envelope', ({ assert }) => {
    const result = parseBatchResult(
      {
        resources: [{ id: 'obj-1' }],
        failedRequests: {
          '1': { code: 'NOT_FOUND', message: 'missing' },
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      },
      (json) => ({ id: String(json.id) })
    )

    assert.equal(result.summary.total, 2)
    assert.equal(result.summary.succeeded, 1)
    assert.equal(result.summary.failed, 1)
    assert.equal(result.failedRequests['1'].code, 'NOT_FOUND')
    assert.deepEqual(result.resources, [{ id: 'obj-1' }])
  })

  test('parses ABORTED top-level code', ({ assert }) => {
    const result = parseBatchResult({
      code: 'ABORTED',
      message: 'None succeeded',
      failedRequests: { '0': { code: 'FAILED_PRECONDITION', message: 'reserved' } },
      summary: { total: 1, succeeded: 0, failed: 1 },
    })

    assert.equal(result.code, 'ABORTED')
    assert.equal(result.summary.succeeded, 0)
  })
})

test.group('batch request bodies', () => {
  test('batchDeleteBody includes defaults', ({ assert }) => {
    const body = batchDeleteBody({
      projectId: 'p1',
      names: ['a', 'b'],
    })
    assert.deepEqual(body, {
      projectId: 'p1',
      names: ['a', 'b'],
      returnPartialSuccess: true,
    })
  })

  test('InventoryBatchUpdateObjectsRequest builds updateMany body', ({ assert }) => {
    const body = batchUpdateManyBody(
      new InventoryBatchUpdateObjectsRequest({
        projectId: 'p1',
        names: ['id1'],
        updateMask: ['storageClass', 'warehouseId'],
        storageClass: 'COLD',
        warehouseId: 'wh-1',
      })
    )

    assert.equal(body.projectId, 'p1')
    assert.deepEqual(body.names, ['id1'])
    assert.deepEqual(body.updateMask, ['storageClass', 'warehouseId'])
    assert.equal(body.storageClass, 'COLD')
    assert.equal(body.warehouseId, 'wh-1')
    assert.equal(body.returnPartialSuccess, true)
  })
})
