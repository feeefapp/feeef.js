import { test } from '@japa/runner'
import { type ProductEntity, ProductStatus, ProductType } from '../../src/core/entities/product.js'
import {
  type ShippingMethodEntity,
  ShippingMethodStatus,
  ShippingMethodPolicy,
} from '../../src/core/entities/shipping_method.js'
import {
  type ShippingPriceEntity,
  ShippingPriceStatus,
} from '../../src/core/entities/shipping_price.js'
import { type StoreEntity } from '../../src/core/entities/store.js'
import { ShippingType } from '../../src/core/entities/order.js'
import { type CartItem, CartService } from '../../src/feeef/services/cart.js'

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

    const item: CartItem = {
      product,
      quantity: 1,
    }

    cart.add(item)
    cart.remove(item)

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
      rates: [[100, 200, 50]],
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
      rates: [[100, 200, 50]],
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

  test('calculate total with addons', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const product: ProductEntity = {
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
      addons: [
        {
          title: 'Extra Cheese',
          subtitle: 'Add more cheese',
          price: 10,
        },
        {
          title: 'Extra Sauce',
          subtitle: 'Add more sauce',
          price: 5,
        },
      ],
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

    // Add product with 2 quantity and 2 addons
    cart.add({
      product,
      quantity: 2,
      addons: {
        'Extra Cheese': 1, // 1 extra cheese
        'Extra Sauce': 2, // 2 extra sauce
      },
    })

    // Base product price: 100 * 2 = 200
    // Addon prices: (10 * 1) + (5 * 2) = 20
    // Expected total: 220
    assert.equal(cart.getSubtotal(), 220)
  })
})

// Helper functions for shipping price tests
const createProduct = (overrides: Partial<ProductEntity> = {}): ProductEntity => ({
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
  ...overrides,
})

const createShippingPrice = (id: string, prices: any): ShippingPriceEntity => ({
  id,
  name: 'Test Shipping Price',
  logoUrl: null,
  storeId: 's1',
  prices,
  status: ShippingPriceStatus.published,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const createStore = (overrides: Partial<StoreEntity> = {}): StoreEntity => ({
  id: 's1',
  slug: 'store-1',
  banner: null,
  action: null,
  domain: null,
  decoration: null,
  name: 'Test Store',
  iconUrl: null,
  logoUrl: null,
  ondarkLogoUrl: null,
  userId: 'u1',
  categories: [],
  title: null,
  description: null,
  addresses: [],
  address: null,
  metadata: {},
  contacts: [],
  integrations: null,
  publicIntegrations: null,
  verifiedAt: null,
  blockedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  defaultShippingRates: [
    [100, 200, 50], // State 1: [pickup, home, store]
    [150, 250, 75], // State 2: [pickup, home, store]
  ],
  ...overrides,
})

test.group('CartService - Shipping Price Priority Chain', () => {
  test('Priority 1: Product shippingFeeId (new system)', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 800)
  })

  test('Priority 2: Store shippingFeeId (new system)', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 600, desk: 300, pickup: 0 },
      },
    })

    const product = createProduct() // No shippingFeeId
    const store = createStore({
      shippingFeeId: 'sp1',
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 600)
  })

  test('Priority 3: Product shippingMethodId (legacy)', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingMethod: ShippingMethodEntity = {
      id: 'sm1',
      name: 'Fast Shipping',
      description: 'Delivered in 2 days',
      logoUrl: null,
      ondarkLogoUrl: null,
      price: 0,
      forks: 0,
      sourceId: 'source1',
      storeId: 'store1',
      rates: [
        [100, 200, 50], // State 1: [pickup, home, store]
      ],
      status: ShippingMethodStatus.published,
      policy: ShippingMethodPolicy.public,
      verifiedAt: null,
      createdAt: null,
      updatedAt: null,
      orders: [],
      source: null,
    }

    const product = createProduct({ shippingMethodId: 'sm1' })
    const store = createStore()

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingMethod(shippingMethod, false)
    cart.updateShippingAddress({ state: '1', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 200)
  })

  test('Priority 4: Store defaultShippingRates (legacy)', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const product = createProduct() // No shippingFeeId or shippingMethodId
    const store = createStore()

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingMethod(store, false)
    cart.updateShippingAddress({ state: '1', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 200)
  })

  test('Product shippingFeeId takes priority over store shippingFeeId', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const productShippingPrice = createShippingPrice('sp-product', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp-product' })
    const store = createStore({
      shippingFeeId: 'sp-store',
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(productShippingPrice, false) // Set product shipping price
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 800) // Should use product shipping price
  })

  test('Falls back to legacy when shipping price has no rate for location', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '02': { home: 600, desk: 300, pickup: 0 }, // Only state 02, not 01
      },
    })

    const shippingMethod: ShippingMethodEntity = {
      id: 'sm1',
      name: 'Fast Shipping',
      description: 'Delivered in 2 days',
      logoUrl: null,
      ondarkLogoUrl: null,
      price: 0,
      forks: 0,
      sourceId: 'source1',
      storeId: 'store1',
      rates: [
        [100, 200, 50], // State 1: [pickup, home, store]
      ],
      status: ShippingMethodStatus.published,
      policy: ShippingMethodPolicy.public,
      verifiedAt: null,
      createdAt: null,
      updatedAt: null,
      orders: [],
      source: null,
    }

    const product = createProduct({ shippingFeeId: 'sp1', shippingMethodId: 'sm1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.setShippingMethod(shippingMethod, false)
    cart.updateShippingAddress({ state: '1', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 200) // Should fall back to legacy
  })

  test('getAvailableShippingTypes uses new system when available', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const availableTypes = cart.getAvailableShippingTypes()
    // Order doesn't matter, just check all types are present
    assert.equal(availableTypes.length, 3)
    assert.isTrue(availableTypes.includes(ShippingType.pickup))
    assert.isTrue(availableTypes.includes(ShippingType.home))
    assert.isTrue(availableTypes.includes(ShippingType.store))
  })

  test('getAvailableShippingTypes falls back to legacy when shipping price not loaded', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const product = createProduct()
    const store = createStore()

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingMethod(store, false)
    cart.updateShippingAddress({ state: '1', country: 'dz', type: ShippingType.home }, false)

    const availableTypes = cart.getAvailableShippingTypes()
    assert.deepEqual(availableTypes, [ShippingType.pickup, ShippingType.home, ShippingType.store])
  })

  test('Shipping type mapping: pickup -> desk, store -> pickup (price keys)', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.pickup }, false)
    assert.equal(cart.getShippingPriceForType(ShippingType.pickup), 400)

    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.store }, false)
    assert.equal(cart.getShippingPriceForType(ShippingType.store), 0)
  })

  test('Returns null when no shipping address state', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: null, country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, null)
  })

  test('Multiple products with same shippingPriceId', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product1 = createProduct({ id: 'p1', shippingFeeId: 'sp1' })
    const product2 = createProduct({ id: 'p2', shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product: product1, quantity: 1 })
    cart.add({ product: product2, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 800)
  })

  test('Multiple products with different shippingFeeIds falls back to store', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const storeShippingPrice = createShippingPrice('sp-store', {
      DZ: {
        '01': { home: 600, desk: 300, pickup: 0 },
      },
    })

    const product1 = createProduct({ id: 'p1', shippingFeeId: 'sp1' })
    const product2 = createProduct({ id: 'p2', shippingFeeId: 'sp2' }) // Different
    const store = createStore({
      shippingFeeId: 'sp-store',
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product: product1, quantity: 1 })
    cart.add({ product: product2, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(storeShippingPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 600) // Should use store shipping price
  })

  test('Cloud ca_ product shippingFeeId is skipped; store matrix still applies', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const storePrice = createShippingPrice('sp-store', {
      DZ: {
        '01': { home: 700, desk: 350, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'ca_account123' })
    const store = createStore({
      shippingFeeId: 'sp-store',
      defaultShippingRates: null,
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(storePrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    // Cloud product id is ignored; store legacy matrix matches → 700.
    assert.equal(cart.getShippingPriceForType(ShippingType.home), 700)
  })

  test('Cloud unassigned shippingFeeId skips legacy matrix entirely', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const legacyPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'unassigned' })
    const store = createStore({
      shippingFeeId: 'unassigned',
      defaultShippingRates: null,
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(legacyPrice, false)
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    // Both refs are Cloud sentinels — cart must not use the loaded matrix by id match.
    assert.isNull(cart.getShippingPriceForType(ShippingType.home))
  })

  test('Store selectedCountry DZ drives matrix when address country is bare dz', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()

    const shippingPrice = createShippingPrice('sp1', {
      DZ: {
        '01': { home: 800, desk: 400, pickup: 0 },
      },
    })

    const product = createProduct({ shippingFeeId: 'sp1' })
    const store = createStore({
      configs: { selectedCountry: 'DZ', currencies: [], selectedCurrency: '0' },
    })

    cart.add({ product, quantity: 1 })
    cart.setStore(store, false)
    cart.setShippingPrice(shippingPrice, false)
    // Address `dz` alone is treated as legacy; store.selectedCountry unlocks the matrix.
    cart.updateShippingAddress({ state: '01', country: 'dz', type: ShippingType.home }, false)

    const price = cart.getShippingPriceForType(ShippingType.home)
    assert.equal(price, 800)
  })
})

test.group('CartService offer quantity clamp', () => {
  test('null maxQuantity must not zero quantity when default offer applies', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product = createProduct({
      price: 0,
      defaultOfferCode: 'pack3',
      forceOffer: true,
      offers: [
        {
          code: 'pack3',
          title: '3 pack',
          price: 1400,
          minQuantity: 3,
          maxQuantity: null as unknown as number,
        },
      ],
    })

    cart.setCurrentItem({ product, quantity: 1 })
    const item = cart.getCurrentItem()!
    assert.equal(item.offer?.code, 'pack3')
    assert.equal(item.quantity, 3)
    assert.equal(cart.getItemTotal(item), 4200)
  })

  test('undefined maxQuantity still clamps to minQuantity', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product = createProduct({
      price: 100,
      defaultOfferCode: 'min2',
      offers: [
        {
          code: 'min2',
          title: 'Buy 2',
          price: 90,
          minQuantity: 2,
        },
      ],
    })

    cart.setCurrentItem({ product, quantity: 1 })
    assert.equal(cart.getCurrentItem()!.quantity, 2)
    assert.equal(cart.getItemTotal(cart.getCurrentItem()!), 180)
  })

  test('null offer.price must not wipe catalog price', (ctx) => {
    const { assert } = ctx as any
    const cart = new CartService()
    const product = createProduct({
      price: 500,
      offers: [
        {
          code: 'ship',
          title: 'Free ship',
          price: null as unknown as number,
          freeShipping: true,
          minQuantity: 1,
        },
      ],
    })

    cart.setCurrentItem({
      product,
      quantity: 2,
      offer: product.offers![0],
    })
    assert.equal(cart.getItemTotal(cart.getCurrentItem()!), 1000)
  })
})
