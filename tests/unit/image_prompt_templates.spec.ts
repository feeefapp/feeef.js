import { test } from '@japa/runner'
import {
  normalizeAttachmentPayloads,
  normalizeImagePromptTemplate,
  serializeAttachmentPayloads,
  serializeImagePromptTemplateUpdate,
} from '../../src/index.js'

test.group('Image prompt templates', () => {
  test('normalizes shared attachment payloads', ({ assert }) => {
    const attachments = normalizeAttachmentPayloads([
      {
        type: 'image',
        value: ' https://cdn.test/image.png ',
        label: 'logo',
        prompt: 'use as reference',
      },
      { type: 'product', value: 'product_1' },
      { type: 'invalid', value: 'ignored' },
      { type: 'store', value: '   ' },
    ])

    assert.deepEqual(attachments, [
      {
        type: 'image',
        value: 'https://cdn.test/image.png',
        label: 'logo',
        prompt: 'use as reference',
      },
      {
        type: 'product',
        value: 'product_1',
        label: null,
        prompt: null,
      },
    ])

    assert.deepEqual(serializeAttachmentPayloads(attachments), [
      {
        type: 'image',
        value: 'https://cdn.test/image.png',
        label: 'logo',
        prompt: 'use as reference',
      },
      {
        type: 'product',
        value: 'product_1',
        label: null,
        prompt: null,
      },
    ])
  })

  test('normalizes snake_case image prompt template payloads', ({ assert }) => {
    const template = normalizeImagePromptTemplate({
      id: 'tpl_1',
      name: 'Food template',
      description: 'Professional food recapture',
      prompt: 'Keep the product real',
      tags: ['food', 'catalog'],
      attachments: [{ type: 'store', value: 'store_1', label: 'brand' }],
      preview_image_url: 'https://cdn.test/preview.png',
      props_schema: {
        lighting_style: {
          name: 'Lighting',
        },
      },
      props: {
        lighting_style: 'soft studio',
      },
      created_at: '2026-03-07T10:00:00.000Z',
      updated_at: '2026-03-07T11:00:00.000Z',
    })

    assert.equal(template.previewImageUrl, 'https://cdn.test/preview.png')
    assert.deepEqual(template.tags, ['food', 'catalog'])
    assert.deepEqual(template.attachments, [
      {
        type: 'store',
        value: 'store_1',
        label: 'brand',
        prompt: null,
      },
    ])
    assert.deepEqual(template.propsSchema, {
      lighting_style: {
        name: 'Lighting',
      },
    })
    assert.equal(template.createdAt, '2026-03-07T10:00:00.000Z')
    assert.equal(template.updatedAt, '2026-03-07T11:00:00.000Z')
  })

  test('serializes update payloads with camelCase API keys', ({ assert }) => {
    const payload = serializeImagePromptTemplateUpdate({
      description: null,
      previewImageUrl: 'https://cdn.test/next.png',
      propsSchema: { angle: 'front' },
      props: { angle: 'front' },
      setToNull: ['description'],
    })

    assert.deepEqual(payload, {
      description: null,
      previewImageUrl: 'https://cdn.test/next.png',
      propsSchema: { angle: 'front' },
      props: { angle: 'front' },
      setToNull: ['description'],
    })
  })
})
