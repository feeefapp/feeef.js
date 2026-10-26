/**
 * Ad pixel event rules (backend `services/integrations/pixel_rules.ts`): one list per store,
 * shared by Meta, TikTok and Snapchat; a product may carry its own for its single-product
 * orders.
 */

/** "When the order reaches `on`, send each named platform its event." */
export interface PixelEventRule {
  id: string
  /** `phase:<draft|open|pack|ship|done|fail>`, `status:<statusId>` or `paid`. */
  on: string
  /** Meta event name (`Purchase`, `Lead`, or the merchant's own). Absent = not sent. */
  meta?: string | null
  tiktok?: string | null
  /** Snap's own names only (`PURCHASE`, `START_CHECKOUT`, `CUSTOM_EVENT_1`…). */
  snapchat?: string | null
}

/** `store.integrations.pixelEvents` / `product.integrationsData.pixelEvents`. */
export interface PixelEvents {
  rules: PixelEventRule[]
}

export type PixelEventPlatform = 'meta' | 'tiktok' | 'snapchat'

/** What a store sends before it saves rules of its own. */
export const DEFAULT_PIXEL_RULES: readonly PixelEventRule[] = [
  {
    id: 'checkout-draft',
    on: 'phase:draft',
    meta: 'Lead',
    tiktok: 'Lead',
    snapchat: 'START_CHECKOUT',
  },
  {
    id: 'checkout-open',
    on: 'phase:open',
    meta: 'Purchase',
    tiktok: 'Purchase',
    snapchat: 'PURCHASE',
  },
]

/**
 * The events the rules send on a draft and on a placed order for one platform, `none` when
 * nothing (what the storefront fires itself when the server cannot). A draft never sends
 * Purchase.
 */
export function pixelCheckoutEvents(
  rules: readonly PixelEventRule[],
  platform: PixelEventPlatform
): { draft: string; open: string } {
  const pick = (on: string) => {
    for (const rule of rules) {
      const name = rule.on === on ? rule[platform]?.trim() : undefined
      if (name && name !== 'none' && !(on === 'phase:draft' && name.toLowerCase() === 'purchase'))
        return name
    }
    return 'none'
  }
  return { draft: pick('phase:draft'), open: pick('phase:open') }
}
