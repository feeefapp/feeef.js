export type Listener<T extends NotifiableService> = (service: T) => void

export class NotifiableService {
  // Array of listeners (functions) to notify when changes occur
  private listeners: Set<Listener<typeof this>> = new Set()

  /**
   * Adds a listener that gets called when `notify` is triggered.
   * @param listener - The function to be called on notification.
   * @returns The same listener for potential chaining or removal.
   */
  addListener(listener: Listener<typeof this>): Listener<typeof this> {
    this.listeners.add(listener) // Using Set for uniqueness and faster removal
    return listener
  }

  /**
   * Removes a previously added listener.
   * @param listener - The function to be removed from the listeners list.
   */
  removeListener(listener: Listener<typeof this>): void {
    this.listeners.delete(listener) // Set deletion is O(1) for better performance
  }

  /**
   * Notifies all registered listeners, passing the service instance.
   * This allows listeners to react to changes.
   */
  notify(): void {
    // Iterating over the Set of listeners and invoking each one
    this.listeners.forEach((listener) => listener(this))
  }

  /**
   * Clears all listeners, removing any references to them.
   */
  clearListeners(): void {
    this.listeners.clear() // Clears the Set entirely
  }

  /**
   * Constructor for NotifiableService, initializes listeners as an empty Set.
   * The Set ensures unique listeners and better management.
   */
  constructor() {
    // Initialization can be skipped since listeners is already initialized as an empty Set
  }
}
