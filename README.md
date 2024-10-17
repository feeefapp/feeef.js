# feeefjs

`feeefjs` is a TypeScript library for managing feeef e-commerce platforms for self-hosted stores. It provides a wrapper for feeef rest api such like send order..., also have frontend srvices like the `CartService` class for managing cart items, shipping methods, and calculating totals. The library also includes a `NotifiableService` base class for handling listeners that react to changes in the service state.

---

# CartService & NotifiableService

A TypeScript service for managing shopping carts in e-commerce platforms. It allows developers to manage cart items, handle shipping methods, calculate totals, and notify components of changes in real-time through listeners.

## Features

- **Cart management**: Add, remove, toggle cart items.
- **Shipping management**: Set shipping method and address.
- **Subtotal and total calculation**: Calculate total prices with or without shipping.
- **Reactive updates**: Use listeners to react to cart changes, useful in React or other reactive UI frameworks.
- **Customization**: Flexible enough to handle product variants and shipping policies.

## Getting Started

### Installation

To use the `CartService` and `NotifiableService`, you can import them into your project.

```typescript
import { CartService } from './services/cart_service.js'
import { NotifiableService } from './services/notifiable_service.js'
```

### Example Usage in TypeScript

```typescript
// Importing required entities and services
import { ProductEntity } from './entities/product.js'
import { StoreEntity } from './entities/store.js'
import { ShippingMethodEntity } from './entities/shipping_method.js'
import { CartService } from './services/cart_service.js'

// Create a product and store entity
const product = new ProductEntity('1', 'Laptop', 1000)
const store = new StoreEntity('1', 'TechStore')

// Initialize CartService
const cart = new CartService()

// Add a product to the cart
cart.setCurrentItem({ product, quantity: 2 })
cart.addCurrentItemToCart()

// Set shipping method (from store)
cart.setShippingMethod(store)

// Calculate totals
console.log('Subtotal:', cart.getSubtotal()) // 2000
console.log('Total with shipping:', cart.getTotal()) // Includes shipping if set

// Example listener to track cart changes
const listener = (updatedCart: CartService) => {
  console.log('Cart updated:', updatedCart)
}
cart.addListener(listener)
cart.notify() // Will trigger listener and log the updated cart

// Remove listener when no longer needed
cart.removeListener(listener)
```

### Example Usage with React

`CartService` integrates well with React using state and effect hooks. Below is an example showing how to update the UI in response to cart changes.

```tsx
import React, { useEffect, useState } from 'react'
import { CartService } from './services/cart_service.js'

const CartComponent = ({ product, store }: { product: ProductEntity, store: StoreEntity }) => {
  // Initialize state with CartService instance
  const [cart, setCart] = useState<CartService>(new CartService())

  useEffect(() => {
    // Set shipping method based on product or store
    cart.setShippingMethod(product.shippingMethod || store)

    // Define a listener to update component state when the cart changes
    const updateCart = (updatedCart: CartService) => {
      setCart(updatedCart)
      console.log('Cart updated:', updatedCart)
    }

    // Register listener
    cart.addListener(updateCart)

    // Cleanup: Remove listener on component unmount
    return () => {
      cart.removeListener(updateCart)
    }
  }, [cart, product, store])

  return (
    <div>
      <h2>Cart</h2>
      <p>Subtotal: {cart.getSubtotal()}</p>
      <p>Total: {cart.getTotal()}</p>
    </div>
  )
}

export default CartComponent
```

### Listener Pattern in NotifiableService

The `NotifiableService` base class allows registering functions (listeners) that react to changes in the service state. This is especially useful in reactive frameworks like React.

#### Add a Listener

```typescript
const listener = (service: CartService) => {
  console.log('Cart updated:', service)
}

cart.addListener(listener) // Adds listener
cart.notify() // Triggers the listener to print the updated cart
```

#### Remove a Listener

```typescript
cart.removeListener(listener) // Removes the previously added listener
```

## API Reference

### CartService

#### Methods

- **`setCurrentItem(item: CartItem): void`**  
  Sets the currently selected cart item.

- **`addCurrentItemToCart(): void`**  
  Adds the current item to the cart. Ignores if already present.

- **`getSubtotal(withCurrentItem = true): number`**  
  Calculates the subtotal price of the cart items.

- **`getTotal(withCurrentItem = true): number`**  
  Calculates the total price of cart items, including shipping if applicable.

- **`setShippingMethod(method: ShippingMethodEntity | StoreEntity): void`**  
  Sets the shipping method for the cart.

- **`addListener(listener: Listener<CartService>): void`**  
  Registers a listener function that is called when the cart changes.

- **`removeListener(listener: Listener<CartService>): void`**  
  Removes a previously registered listener.

### NotifiableService

#### Methods

- **`addListener(listener: Listener<NotifiableService>): Listener<NotifiableService>`**  
  Adds a listener that is notified on service changes.

- **`removeListener(listener: Listener<NotifiableService>): void`**  
  Removes a listener.

- **`notify(): void`**  
  Notifies all registered listeners.

## Best Practices

1. **Use Listeners for UI updates**: In reactive frameworks like React, use `addListener` to trigger state updates or side effects based on changes in the `CartService`.

2. **Unsubscribe Listeners**: Always clean up listeners in your components to prevent memory leaks, especially in React's `useEffect`.

3. **Optimize with Cached Subtotals**: The `CartService` uses caching for subtotals to avoid recalculations. Rely on `getSubtotal()` and `getTotal()` for efficient price calculations.

## Contributing

Feel free to fork this repository and contribute improvements, bug fixes, or additional features. Open a pull request for any major changes!