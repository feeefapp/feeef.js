import { test } from '@japa/runner'
import {
  createImageGenerationFormData,
  normalizeImageGeneration,
  normalizePaginatedResponse,
} from '../../src/index.js'

test.group('Image generations', () => {
  test('builds multipart form data for generation requests', ({ assert }) => {
    const formData = createImageGenerationFormData({
      storeId: 'store_1',
      title: 'Recapture product',
      prompt: 'Make it professional',
      imageFile: new Uint8Array([1, 2, 3, 4]),
      resolution: 'MEDIA_RESOLUTION_HIGH',
      imageSize: '2K',
      aspectRatio: '1:1',
      attachments: [
        {
          type: 'product',
          value: 'product_1',
          label: 'main product',
          prompt: 'keep exact identity',
        },
      ],
      googleSearch: true,
      imageSearch: false,
    })

    assert.equal(formData.get('storeId'), 'store_1')
    assert.equal(formData.get('title'), 'Recapture product')
    assert.equal(formData.get('prompt'), 'Make it professional')
    assert.equal(formData.get('resolution'), 'MEDIA_RESOLUTION_HIGH')
    assert.equal(formData.get('imageSize'), '2K')
    assert.equal(formData.get('aspectRatio'), '1:1')
    assert.equal(formData.get('googleSearch'), 'true')
    assert.equal(formData.get('imageSearch'), 'false')
    assert.equal(
      formData.get('attachments'),
      JSON.stringify([
        {
          type: 'product',
          value: 'product_1',
          label: 'main product',
          prompt: 'keep exact identity',
        },
      ])
    )

    const imageFile = formData.get('imageFile')
    assert.equal(Boolean(imageFile), true)
  })

  test('defaults resolution to MEDIA_RESOLUTION_HIGH when omitted', ({ assert }) => {
    const formData = createImageGenerationFormData({
      storeId: 'store_1',
      prompt: 'Test',
    })
    assert.equal(formData.get('resolution'), 'MEDIA_RESOLUTION_HIGH')
    assert.equal(formData.get('imageSize'), null)
  })

  test('normalizes image generation payloads with snake_case fields', ({ assert }) => {
    const generation = normalizeImageGeneration({
      id: 'gen_1',
      user_id: 'user_1',
      store_id: 'store_1',
      title: 'Catalog recapture',
      generated_image_url: 'https://cdn.test/generated.png',
      configs: {
        result: {
          imageUrl: 'https://cdn.test/generated.png',
        },
      },
      generations: [
        {
          id: 'hist_1',
          created_at: '2026-03-07T10:00:00.000Z',
          generated_image_url: 'https://cdn.test/hist.png',
          configs: { step: 1 },
        },
      ],
      status: 'published',
      tags: ['product', 'catalog'],
      created_at: '2026-03-07T09:00:00.000Z',
      updated_at: '2026-03-07T10:00:00.000Z',
      deleted_at: null,
      user: {
        id: 'user_1',
        name: 'Mohamad',
        photo_url: 'https://cdn.test/user.png',
      },
    })

    assert.equal(generation.generatedImageUrl, 'https://cdn.test/generated.png')
    assert.equal(generation.user?.photoUrl, 'https://cdn.test/user.png')
    assert.equal(generation.generations[0].createdAt, '2026-03-07T10:00:00.000Z')
    assert.equal(generation.generations[0].generatedImageUrl, 'https://cdn.test/hist.png')
  })

  test('normalizes paginated responses using backend meta fields', ({ assert }) => {
    const response = normalizePaginatedResponse(
      {
        data: [
          {
            id: 'gen_1',
            status: 'completed',
            tags: [],
            configs: {},
            generations: [],
            created_at: '2026-03-07T09:00:00.000Z',
            updated_at: '2026-03-07T09:10:00.000Z',
          },
        ],
        meta: {
          current_page: 1,
          last_page: 3,
          per_page: 10,
          total: 21,
        },
      },
      normalizeImageGeneration
    )

    assert.equal(response.page, 1)
    assert.equal(response.limit, 10)
    assert.equal(response.total, 21)
    assert.equal(response.hasMore, true)
    assert.equal(response.data[0].id, 'gen_1')
  })
})
