import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartState } from "./types";

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

let nextId = 1;

export const CartProvider: React.FC<{
  children: React.ReactNode;
  initialState?: CartState;
  onStateChange?: (state: CartState) => void;
}> = ({ children, initialState, onStateChange }) => {
  const [items, setItems] = useState<CartItem[]>(initialState?.items ?? []);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const updateItems = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        onStateChange?.({ items: next });
        return next;
      });
    },
    [onStateChange]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      updateItems((prev) => {
        // Check if same product+variant already in cart
        const existing = prev.find(
          (i) =>
            i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          return prev.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, { ...item, id: `cart_${nextId++}` }];
      });
      // Auto-open cart drawer briefly
      setIsCartOpen(true);
    },
    [updateItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((prev) => prev.filter((i) => i.id !== id));
    },
    [updateItems]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      updateItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    },
    [updateItems, removeItem]
  );

  const clearCart = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((acc, i) => acc + (i.price ?? 0) * i.quantity, 0),
    [items]
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
    ]
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
