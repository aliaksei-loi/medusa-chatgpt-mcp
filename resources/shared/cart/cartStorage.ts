import type { CartItem } from "./types";

const CART_STORAGE_KEY = "medusa-mcp-cart";

/**
 * Read cart items from localStorage.
 * Returns an empty array if nothing stored or on parse error.
 */
export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Write cart items to localStorage.
 * Other iframes on the same origin will receive a `storage` event.
 */
export function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or storage unavailable — silently ignore
  }
}

/**
 * Subscribe to cart changes made by OTHER iframes / windows on the same origin.
 *
 * The `storage` event fires on every Window that shares the same storage area
 * EXCEPT the one that caused the write — which is exactly the cross-widget
 * sync behaviour we need.
 *
 * Returns an unsubscribe function.
 */
export function subscribeCart(
  callback: (items: CartItem[]) => void,
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key !== CART_STORAGE_KEY) return;
    try {
      const items = e.newValue ? JSON.parse(e.newValue) : [];
      callback(Array.isArray(items) ? items : []);
    } catch {
      callback([]);
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/**
 * Generate a unique cart item ID that won't collide across widgets.
 * Uses timestamp + random suffix instead of a simple counter.
 */
export function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
