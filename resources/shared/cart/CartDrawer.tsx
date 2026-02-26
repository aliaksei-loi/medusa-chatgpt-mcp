import React, { useEffect, useRef } from "react";
import { Heading, Text, Button } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";
import { useCallTool } from "mcp-use/react";
import { useCart } from "./CartContext";
import { CartItemPreview } from "./CartItemPreview";

function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItems,
    subtotal,
    currencyCode,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
  } = useCart();

  const {
    callTool: placeOrder,
    isPending: isPlacingOrder,
  } = useCallTool("place-order");

  const prevTotalRef = useRef(totalItems);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close after 5s when opened by add-to-cart
  useEffect(() => {
    if (isCartOpen && totalItems > prevTotalRef.current) {
      timerRef.current = setTimeout(() => {
        closeCart();
      }, 5000);
    }
    prevTotalRef.current = totalItems;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isCartOpen, totalItems, closeCart]);

  // Cancel auto-close on mouse enter
  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-20 rounded-2xl transition-all duration-200"
        style={{
          backgroundColor: isCartOpen ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0)",
          backdropFilter: isCartOpen ? "blur(2px)" : "blur(0px)",
          pointerEvents: isCartOpen ? "auto" : "none",
        }}
        onClick={closeCart}
      />

      {/* Modal */}
      <div
        className="absolute inset-0 z-30 flex items-start justify-center pt-4 px-4"
        style={{
          pointerEvents: isCartOpen ? "auto" : "none",
        }}
        onClick={closeCart}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-sm transition-all duration-200 ease-out"
          style={{
            opacity: isCartOpen ? 1 : 0,
            transform: isCartOpen ? "scale(1)" : "scale(0.95)",
            maxHeight: "min(420px, 90%)",
            pointerEvents: isCartOpen ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={cancelTimer}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
            <Heading level="h3" className="text-sm">
              {totalItems > 0
                ? `Cart (${totalItems} item${totalItems !== 1 ? "s" : ""})`
                : "Your cart is empty"}
            </Heading>
            <button
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              onClick={closeCart}
            >
              <XMarkMini />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Text className="text-neutral-400 text-sm mb-1">
                  No items in your cart
                </Text>
                <Text className="text-neutral-400 text-xs">
                  Browse products to add items
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <CartItemPreview
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer with subtotal */}
          {items.length > 0 && (
            <div className="border-t border-neutral-100 p-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center">
                <Text className="text-neutral-600 text-sm">Subtotal</Text>
                <Text className="text-neutral-950 font-medium text-sm">
                  {formatPrice(subtotal, currencyCode)}
                </Text>
              </div>
              <Text className="text-neutral-400 text-[0.55rem]">
                Taxes and shipping calculated at checkout
              </Text>
              <Button
                variant="primary"
                size="small"
                className="w-full"
                disabled={isPlacingOrder || items.length === 0}
                onClick={() => {
                  placeOrder({
                    items: items.map((i) => ({
                      variantId: i.variantId,
                      quantity: i.quantity,
                      title: i.title,
                    })),
                  }).then(() => {
                    clearCart();
                    closeCart();
                  });
                }}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
              <Button
                variant="secondary"
                size="small"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
