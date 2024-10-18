import { test } from '@japa/runner'
import { ProductEntity, ProductStatus, ProductType } from '../../src/core/entities/product.js'
import {
  ShippingMethodEntity,
  ShippingMethodStatus,
  ShippingMethodPolicy,
} from '../../src/core/entities/shipping_method.js'
import { CartService } from '../../src/feeef/services/cart.js'

test.group('CartService', () => {
  test('add new item to cart', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product: ProductEntity = {
      id: 'p1',
      photoUrl: null,
      slug: 'product-1',
      name: 'Test Product',
      price: 100,
      stock: 50,
      sold: 10,
      views: 100,
      likes: 20,
      dislikes: 2,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    cart.add({ product, quantity: 2 })
    assert.equal(cart.getAll().length, 1)
    assert.equal(cart.getAll()[0].quantity, 2)
    assert.equal(cart.getAll()[0].product.id, 'p1')
  })

  test('increase quantity of existing item', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product: ProductEntity = {
      id: 'p1',
      photoUrl: null,
      slug: 'product-1',
      name: 'Test Product',
      price: 100,
      stock: 50,
      sold: 10,
      views: 100,
      likes: 20,
      dislikes: 2,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    cart.add({ product, quantity: 2 })
    cart.add({ product, quantity: 3 })

    assert.equal(cart.getAll().length, 1)
    assert.equal(cart.getAll()[0].quantity, 5)
  })

  test('remove item from cart', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product: ProductEntity = {
      photoUrl: null,
      id: 'p1',
      slug: 'product-1',
      name: 'Test Product',
      price: 100,
      stock: 50,
      sold: 10,
      views: 100,
      likes: 20,
      dislikes: 2,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    cart.add({ product, quantity: 2 })
    cart.remove(product.id)

    assert.equal(cart.getAll().length, 0)
  })

  test('calculate subtotal', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product1: ProductEntity = {
      photoUrl: null,
      id: 'p1',
      slug: 'product-1',
      name: 'Test Product 1',
      price: 100,
      stock: 50,
      sold: 10,
      views: 100,
      likes: 20,
      dislikes: 2,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    const product2: ProductEntity = {
      id: 'p2',
      photoUrl: null,
      slug: 'product-2',
      name: 'Test Product 2',
      price: 200,
      stock: 30,
      sold: 5,
      views: 80,
      likes: 15,
      dislikes: 1,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    cart.add({ product: product1, quantity: 2 })
    cart.add({ product: product2, quantity: 1 })

    assert.equal(cart.getSubtotal(), 400)
  })

  test('set and get shipping method', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const shippingMethod: ShippingMethodEntity = {
      id: 's1',
      name: 'Fast Shipping',
      description: 'Delivered in 2 days',
      logoUrl: null,
      ondarkLogoUrl: null,
      price: 50,
      forks: 0,
      sourceId: 'source1',
      storeId: 'store1',
      rates: null,
      status: ShippingMethodStatus.published,
      policy: ShippingMethodPolicy.public,
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: [],
      source: null,
    }

    cart.setShippingMethod(shippingMethod)
    assert.deepEqual(cart.getShippingMethod(), shippingMethod)
  })

  test('calculate total with shipping', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product: ProductEntity = {
      id: 'p1',
      slug: 'product-1',
      name: 'Test Product',
      price: 100,
      photoUrl: null,
      stock: 50,
      sold: 10,
      views: 100,
      likes: 20,
      dislikes: 2,
      status: ProductStatus.published,
      type: ProductType.physical,
      metadata: {},
      media: [],
      storeId: 's1',
      category: { name: 'Category 1', description: 'Category 1', photoUrl: null },
      createdAt: new Date(),
      updatedAt: new Date(),
      decoration: null,
      title: null,
      description: null,
      body: null,
      sku: null,
      cost: null,
      discount: null,
      variant: null,
      verifiedAt: null,
      blockedAt: null,
    }

    const shippingMethod: ShippingMethodEntity = {
      id: 's1',
      name: 'Fast Shipping',
      description: 'Delivered in 2 days',
      logoUrl: null,
      ondarkLogoUrl: null,
      price: 50,
      forks: 0,
      sourceId: 'source1',
      storeId: 'store1',
      rates: null,
      status: ShippingMethodStatus.published,
      policy: ShippingMethodPolicy.public,
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: [],
      source: null,
    }

    cart.add({ product, quantity: 2 })
    cart.setShippingMethod(shippingMethod)

    assert.equal(cart.getTotal(), 250)
  })
})
