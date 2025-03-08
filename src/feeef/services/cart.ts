import { ShippingType } from '../../core/entities/order.js'
import { ProductEntity, ProductOffer } from '../../core/entities/product.js'
import {
  ShippingMethodEntity,
  ShippingMethodPolicy,
  ShippingMethodStatus,
} from '../../core/entities/shipping_method.js'
import { StoreEntity } from '../../core/entities/store.js'
import { NotifiableService } from './service.js'

/**
 * Represents an item in the cart.
 */
export interface CartItem {
  product: ProductEntity
  offer?: ProductOffer
  quantity: number
  variantPath?: string
  addons?: Record<string, number>
}

/**
 * Cart shipping types.
 * - `pickup`: The user will pick up the order from the closest desk.
 * - `home`: The order will be delivered to the user's home.
 * - `store`: The order will be delivered to the store.
 */
// export type CartShippingTypes = 'pickup' | 'home' | 'store'

/**
 * Interface for a shipping address.
 */
export interface CartShippingAddress {
  name: string | null
  phone: string | null
  city: string | null
  state: string | null
  street: string | null
  country: 'dz'
  type: ShippingType
}

/**
 * Manages the shopping cart and its operations.
 */
export class CartService extends NotifiableService {
  private items: Map<string, CartItem> = new Map() // Fast lookup of cart items
  private shippingMethod: ShippingMethodEntity | null = null
  private shippingAddress: CartShippingAddress = {
    name: null,
    phone: null,
    city: null,
    state: null,
    street: null,
    country: 'dz',
    type: ShippingType.pickup,
  }
  private cachedSubtotal: number | null = null // Cache for subtotal to avoid redundant calculations
  private currentItem: CartItem | null = null

  /**
   * Sets the current item to be managed in the cart.
   * @param item - The item to be set as current.
   */
  setCurrentItem(item: CartItem, notify = true): void {
    this.currentItem = item

    if (this.has(this.currentItem.product.id)) {
      this.items.set(this.currentItem.product.id, this.currentItem)
    }
    this.cachedSubtotal = null
    if (notify) {
      this.notify()
    }
  }

  /**
   * Clamps the quantity to be within the offer's min/max range
   * @param offer - The offer containing quantity constraints
   * @param quantity - The quantity to clamp
   * @returns The clamped quantity value
   */
  private clampQuantityToOfferLimits(offer: ProductOffer, quantity: number): number {
    if (offer.minQuantity !== undefined) {
      quantity = Math.max(quantity, offer.minQuantity)
    }
    if (offer.maxQuantity !== undefined) {
      quantity = Math.min(quantity, offer.maxQuantity)
    }
    return quantity
  }

  /**
   * Update item by id.
   * @param id - The id of the item to update.
   * @param item - a partial item to update.
   */
  updateItem(id: string, item: Partial<CartItem>, notify = true): void {
    const currentItem = this.items.get(id)

    if (currentItem) {
      const newItem = { ...currentItem, ...item }
      // Clamp quantity if there's an offer with constraints
      if (newItem.offer) {
        newItem.quantity = this.clampQuantityToOfferLimits(newItem.offer, newItem.quantity)
      }

      this.items.set(id, newItem)
      this.cachedSubtotal = null
      if (notify) {
        this.notify()
      }
    }
  }

  /**
   * Update current item.
   * @param item - a partial item to update.
   */
  updateCurrentItem(item: Partial<CartItem>, notify = true): void {
    if (!this.currentItem) return

    this.currentItem = { ...this.currentItem, ...item }

    if (this.has(this.currentItem.product.id)) {
      this.items.set(this.currentItem.product.id, this.currentItem)
    }

    this.cachedSubtotal = null
    if (notify) {
      this.notify()
    }
  }

  /**
   * Update shipping address.
   * @param address - a partial address to update.
   */
  updateShippingAddress(address: Partial<CartShippingAddress>, notify = true): void {
    this.shippingAddress = { ...this.shippingAddress, ...address }
    this.cachedSubtotal = null
    if (notify) {
      this.notify()
    }
  }

  /**
   * Update shipping method.
   * @param method - a partial shipping method to update.
   */
  updateShippingMethod(method: Partial<ShippingMethodEntity>, notify = true): void {
    if (!this.shippingMethod) return

    this.shippingMethod = { ...this.shippingMethod, ...method }
    this.cachedSubtotal = null
    if (notify) {
      this.notify()
    }
  }

  /**
   * Retrieves the current item in the cart.
   * @returns The current cart item or null if not set.
   */
  getCurrentItem(): CartItem | null {
    return this.currentItem
  }

  /**
   * Checks if the current item is already in the cart.
   * @returns True if the current item is in the cart, false otherwise.
   */
  isCurrentItemInCart(): boolean {
    return this.currentItem ? this.items.has(this.currentItem.product.id) : false
  }

  /**
   * Adds the current item to the cart if it's not already present.
   */
  addCurrentItemToCart(): void {
    if (!this.currentItem || this.isCurrentItemInCart()) return
    this.add(this.currentItem)
    this.cachedSubtotal = null
  }

  /**
   * Removes the current item from the cart if present.
   */
  removeCurrentItemFromCart(): void {
    if (this.currentItem) {
      this.remove(this.currentItem.product.id)
    }
  }

  /**
   * Toggles the current item's presence in the cart (add/remove).
   */
  toggleCurrentItemInCart(): void {
    this.isCurrentItemInCart() ? this.removeCurrentItemFromCart() : this.addCurrentItemToCart()
  }

  /**
   * Adds an item to the cart. If the item is already present, increments its quantity.
   * @param item - The cart item to add.
   */
  add(item: CartItem): void {
    const existingItem = this.items.get(item.product.id)

    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      this.items.set(item.product.id, item)
    }

    this.cachedSubtotal = null // Reset subtotal cache
    this.notifyIfChanged()
  }

  /**
   * Checks if an item exists in the cart by product ID.
   * @param itemId - The ID of the item to check.
   * @returns True if the item exists in the cart, false otherwise.
   */
  has(itemId: string): boolean {
    return this.items.has(itemId)
  }

  /**
   * Removes an item from the cart by product ID.
   * @param itemId - The ID of the item to remove.
   */
  remove(itemId: string): void {
    if (this.items.delete(itemId)) {
      this.cachedSubtotal = null
      this.notifyIfChanged()
    }
  }

  /**
   * Clears all items from the cart.
   */
  clear(notify = true): void {
    if (this.items.size > 0) {
      this.items.clear()
      this.cachedSubtotal = null
      if (notify) {
        this.notify()
      }
    }
  }

  /**
   * Retrieves the subtotal of the cart.
   * @param withCurrentItem - Whether to include the current item in the subtotal.
   * @returns The subtotal amount.
   */
  getSubtotal(withCurrentItem = true): number {
    if (this.cachedSubtotal === null) {
      this.cachedSubtotal = Array.from(this.items.values()).reduce((sum, item) => {
        return sum + this.getItemTotal(item)
      }, 0)
    }

    if (withCurrentItem && this.currentItem && !this.has(this.currentItem.product.id)) {
      return this.cachedSubtotal + this.getItemTotal(this.currentItem)
    }

    return this.cachedSubtotal
  }

  /**
   * Calculates the total price for a cart item.
   * @param item - The cart item.
   * @returns The total price for the item.
   */
  getItemTotal(item: CartItem): number {
    const { product, variantPath, quantity, offer, addons } = item
    let price = product.price
    let discount = product.discount ?? 0

    // Handle variant pricing if a variant path exists
    if (variantPath) {
      const parts = variantPath.split('/')
      let currentVariant = product.variant

      for (const part of parts) {
        if (!currentVariant) break
        const option = currentVariant.options.find((o) => o.name === part)
        if (!option) break
        price = option.price ?? price
        discount = option.discount ?? discount
        currentVariant = option.child
      }
    }

    // Apply offer if present
    if (offer) {
      if (offer.price !== undefined) {
        // If offer has a fixed price, use it
        price = offer.price
        discount = 0 // Reset discount since we're using a fixed price
      }
    }

    // Calculate base product price with quantity
    let total = (price - discount) * quantity

    // Add pricing for addons if present
    if (addons && product.addons) {
      for (const [addonId, addonQuantity] of Object.entries(addons)) {
        // Find the addon in the product's addons array
        const addon = product.addons.find((a) => a.title === addonId)
        if (addon && addon.price) {
          // Add the addon price * quantity to the total
          total += addon.price * addonQuantity
        }
      }
    }

    return total
  }

  /**
   * Validates if an offer can be applied to the given quantity
   * @param offer - The offer to validate
   * @param quantity - The quantity to check
   * @returns boolean indicating if the offer is valid for the quantity
   */
  isOfferValidForQuantity(offer: ProductOffer, quantity: number): boolean {
    if (offer.minQuantity && quantity < offer.minQuantity) return false
    if (offer.maxQuantity && quantity > offer.maxQuantity) return false
    return true
  }

  /**
   * Updates the offer for a specific cart item
   * @param itemId - The ID of the item to update
   * @param offer - The offer to apply, or undefined to remove the offer
   */
  updateItemOffer(itemId: string, offer?: ProductOffer): void {
    const item = this.items.get(itemId)
    if (!item) return

    const updatedItem = { ...item, offer }
    // If applying an offer, ensure quantity is within limits
    if (offer) {
      updatedItem.quantity = this.clampQuantityToOfferLimits(offer, item.quantity)
    }

    this.updateItem(itemId, updatedItem)
    this.cachedSubtotal = null
    this.notifyIfChanged()
  }

  /**
   * Updates the offer for the current item
   * @param offer - The offer to apply, or undefined to remove the offer
   */
  updateCurrentItemOffer(offer?: ProductOffer): void {
    if (!this.currentItem) return

    const updatedItem = { ...this.currentItem }
    updatedItem.offer = offer

    // If applying an offer, ensure quantity is within limits
    if (offer) {
      updatedItem.quantity = this.clampQuantityToOfferLimits(offer, this.currentItem.quantity)
    }

    this.updateCurrentItem(updatedItem)
    this.cachedSubtotal = null
    this.notifyIfChanged()
  }

  /**
   * Sets the shipping method.
   * @param method - Either a store or a shipping method.
   */
  setShippingMethod(method: ShippingMethodEntity | StoreEntity, notify = true): void {
    const store = (method as StoreEntity)?.defaultShippingRates ? (method as StoreEntity) : null
    const shippingMethod = (method as ShippingMethodEntity)?.rates
      ? (method as ShippingMethodEntity)
      : null

    if (store) {
      this.shippingMethod = {
        id: store.id,
        name: store.name,
        description: store.description,
        logoUrl: store.logoUrl,
        ondarkLogoUrl: store.ondarkLogoUrl,
        price: 0,
        forks: 0,
        sourceId: store.id,
        storeId: store.id,
        rates: store.defaultShippingRates,
        status: ShippingMethodStatus.published,
        policy: ShippingMethodPolicy.public,
        verifiedAt: null,
        createdAt: null,
        updatedAt: null,
        orders: [],
        source: null,
      }
      if (notify) {
        this.notify()
      }
    } else if (shippingMethod) {
      this.shippingMethod = shippingMethod
      if (notify) {
        this.notify()
      }
    } else {
      throw new Error('Invalid shipping method')
    }
  }

  // getAvailableShippingTypes
  /**
   * Retrieves the available shipping types for the current shipping method.
   *
   *   rates is a 2D array for example `[[10, 20, 30], [5, 10, 15]]`
   *   where the first array is for `home` fees and the second is for `pickup` fees, and the third is for `store` fees
   *   if the fee value is 0, then it's free shipping, and if it's null, then it's not available
   *
   * @returns An array of available shipping types.
   */
  getAvailableShippingTypes(): ShippingType[] {
    if (!this.shippingMethod?.rates) return []

    var state = Number.parseInt(this.shippingAddress.state!)
    var stateRates = this.shippingMethod.rates[state - 1]

    if (!stateRates) return []

    var availableTypes: ShippingType[] = []

    if (stateRates[0] || stateRates[0] === 0) availableTypes.push(ShippingType.pickup)
    if (stateRates[1] || stateRates[1] === 0) availableTypes.push(ShippingType.home)
    if (stateRates[2] || stateRates[2] === 0) availableTypes.push(ShippingType.store)

    return availableTypes
  }

  /**
   * Retrieves the current shipping method.
   * @returns The shipping method or null.
   */
  getShippingMethod(): ShippingMethodEntity | null {
    return this.shippingMethod
  }

  /**
   * Sets the shipping address for the cart.
   * @param address - The shipping address.
   */
  setShippingAddress(address: CartShippingAddress, notify = true): void {
    if (
      this.shippingAddress.city !== address.city ||
      this.shippingAddress.state !== address.state ||
      this.shippingAddress.type !== address.type
    ) {
      this.shippingAddress = address
      if (notify) {
        this.notify()
      }
    }
  }

  /**
   * Retrieves the current shipping address.
   * @returns The shipping address.
   */
  getShippingAddress(): CartShippingAddress {
    return this.shippingAddress
  }

  /**
   * Calculates the shipping price based on the address and shipping method.
   * @returns The shipping price or 0 if not applicable.
   */
  getShippingPrice(): number {
    if (!this.shippingMethod) return 0
    if (!this.shippingAddress.state) return this.shippingMethod.price ?? 0

    const stateIndex = Number.parseInt(this.shippingAddress.state, 10) - 1
    const rates = this.shippingMethod.rates?.[stateIndex]

    return this.shippingAddress.type === 'pickup' ? (rates?.[0] ?? 0) : (rates?.[1] ?? 0)
  }

  /**
   * Gets the shipping price for a specific shipping type using the current shipping address state.
   * @param type - The shipping type to check (pickup, home, store)
   * @returns The shipping price for the specified type, or null if not available
   */
  getShippingPriceForType(type: ShippingType): number | null {
    if (!this.shippingMethod?.rates || !this.shippingAddress.state) return null

    const stateIndex = Number.parseInt(this.shippingAddress.state, 10) - 1
    const rates = this.shippingMethod.rates[stateIndex]

    if (!rates) return null

    switch (type) {
      case ShippingType.pickup:
        return rates[0]
      case ShippingType.home:
        return rates[1]
      case ShippingType.store:
        return rates[2]
      default:
        return null
    }
  }

  /**
   * Calculates the total cost of the cart including shipping.
   * @param withCurrentItem - Whether to include the current item in the total.
   * @returns The total cost.
   */
  getTotal(withCurrentItem = true): number {
    return this.getSubtotal(withCurrentItem) + (this.getShippingPrice() ?? 0)
  }

  /**
   * Retrieves all items in the cart.
   * @returns An array of cart items.
   */
  getAll(): CartItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Checks if the cart is empty.
   * @returns True if the cart is empty, otherwise false.
   */
  isEmpty(): boolean {
    return this.items.size === 0
  }

  /**
   * Notifies listeners if the cart state has meaningfully changed.
   */
  private notifyIfChanged(): void {
    // This method could be enhanced to track and notify only meaningful changes
    this.notify()
  }
}
