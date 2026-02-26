import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem, CartState } from "./types";
import {
  readCart,
  writeCart,
  subscribeCart,
  generateCartItemId,
} from "./cartStorage";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  currencyCode: string;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Merge initial items with localStorage items.
 * localStorage takes priority; initialState items are added only if their
 * productId+variantId combination doesn't already exist in storage.
 */
function mergeInitialState(
  stored: CartItem[],
  initial?: CartItem[],
): CartItem[] {
  if (!initial || initial.length === 0) return stored;
  if (stored.length === 0) return initial;

  const existing = new Set(
    stored.map((i) => `${i.productId}::${i.variantId ?? ""}`),
  );
  const toAdd = initial.filter(
    (i) => !existing.has(`${i.productId}::${i.variantId ?? ""}`),
  );
  return [...stored, ...toAdd];
}

export const CartProvider: React.FC<{
  children: React.ReactNode;
  initialState?: CartState;
  onStateChange?: (state: CartState) => void;
}> = ({ children, initialState, onStateChange }) => {
  // Initialise from localStorage, merging any initialState prop
  const [items, setItems] = useState<CartItem[]>(() =>
    mergeInitialState(readCart(), initialState?.items),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Keep a ref so the storage-event handler always sees the latest items
  // without needing items in its dependency array.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // ── Persist to localStorage on every change ────────────────────────
  const updateItems = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        writeCart(next);
        onStateChange?.({ items: next });
        return next;
      });
    },
    [onStateChange],
  );

  // ── Subscribe to changes from OTHER widgets ────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeCart((externalItems) => {
      // Only update if the data actually changed (avoid loops)
      const current = JSON.stringify(itemsRef.current);
      const incoming = JSON.stringify(externalItems);
      if (current !== incoming) {
        setItems(externalItems);
        onStateChange?.({ items: externalItems });
      }
    });
    return unsubscribe;
  }, [onStateChange]);

  // ── Cart mutations ─────────────────────────────────────────────────
  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      updateItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === item.productId && i.variantId === item.variantId,
        );
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
        }
        return [...prev, { ...item, id: generateCartItemId() }];
      });
      setIsCartOpen(true);
    },
    [updateItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((prev) => prev.filter((i) => i.id !== id));
    },
    [updateItems],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      updateItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
      );
    },
    [updateItems, removeItem],
  );

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  // ── Derived values ─────────────────────────────────────────────────
  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0),
    [items],
  );

  const currencyCode = items[0]?.currencyCode ?? "usd";

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((p) => !p), []);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      currencyCode,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      currencyCode,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};
