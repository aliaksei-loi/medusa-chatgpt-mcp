import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import {
  McpUseProvider,
  useCallTool,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import "../styles.css";
import { cartWidgetSchema } from "./types";
import type { CartWidgetProps } from "./types";
import { CartItemFull } from "./components/CartItemFull";
import { CartTotals } from "./components/CartTotals";
import { CartProvider, useCart, writeCart } from "../shared/cart";
import type { CartItem } from "../shared/cart";

import { Button, Container, Heading, IconButton, Text } from "@medusajs/ui";

import { ArrowsPointingOutMini, XMarkMini, ChatBubble } from "@medusajs/icons";

export const widgetMetadata: WidgetMetadata = {
  description:
    "Display shopping cart with items, quantities, totals and checkout options",
  props: cartWidgetSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Loading cart...",
    invoked: "Cart loaded",
    csp: {
      resourceDomains: ["https://cdn.openai.com"],
    },
  },
};

import { ShoppingBagIcon } from "../shared/ShoppingBagIcon";

const CartWidgetInner: React.FC = () => {
  const {
    props,
    isPending,
    displayMode,
    requestDisplayMode,
    sendFollowUpMessage,
  } = useWidget<CartWidgetProps>();

  const { callTool: placeOrder, isPending: isPlacingOrder } =
    useCallTool("place-order");

  // Read cart state from the shared CartProvider (backed by localStorage)
  const {
    items: localItems,
    totalItems: localTotalItems,
    subtotal: localSubtotal,
    currencyCode: localCurrencyCode,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  // When the view-cart tool provides items via props, use them as source of
  // truth and sync into localStorage so other widgets pick them up.
  const hasSynced = useRef(false);
  useEffect(() => {
    if (
      !isPending &&
      props?.items &&
      props.items.length > 0 &&
      !hasSynced.current
    ) {
      hasSynced.current = true;
      writeCart(props.items as CartItem[]);
    }
  }, [isPending, props?.items]);

  // Use props items when available (server-authoritative), fall back to localStorage
  const items =
    !isPending && props?.items && props.items.length > 0
      ? (props.items as CartItem[])
      : localItems;
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce(
    (acc, i) => acc + (i.price ?? 0) * i.quantity,
    0,
  );
  const currencyCode = items[0]?.currencyCode ?? localCurrencyCode;

  if (isPending) {
    return (
      <div className="relative bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
        <div className="h-6 w-64 bg-neutral-100 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
          <div className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const isFullscreen = displayMode === "fullscreen";

  return (
    <div className="relative bg-neutral-50 border border-neutral-200 rounded-2xl">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {isFullscreen ? (
          <IconButton
            variant="transparent"
            size="small"
            onClick={() => requestDisplayMode("inline")}
            title="Exit"
          >
            <XMarkMini />
          </IconButton>
        ) : (
          <IconButton
            variant="transparent"
            size="small"
            onClick={() => requestDisplayMode("fullscreen")}
            title="Fullscreen"
          >
            <ArrowsPointingOutMini />
          </IconButton>
        )}
      </div>

      <div className="p-6 pb-4">
        <Heading level="h2" className="text-neutral-950 mb-1">
          Shopping Cart
        </Heading>
        <Text className="text-neutral-500 text-sm">
          {totalItems > 0
            ? `You have ${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
            : "Your cart is empty"}
        </Text>
      </div>

      {items.length === 0 ? (
        /* Empty state */
        <div className="px-6 pb-8 flex flex-col items-center text-center py-12">
          <ShoppingBagIcon size={40} fill="#a3a3a3" />
          <Heading level="h3" className="text-neutral-950 mt-4 mb-2">
            Cart
          </Heading>
          <Text className="text-neutral-500 text-sm mb-6 max-w-xs">
            You don&apos;t have anything in your cart. Let&apos;s change that —
            ask me to search for products.
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={() =>
              sendFollowUpMessage("Search for all available products")
            }
          >
            <ChatBubble className="w-3.5 h-3.5" />
            Browse Products
          </Button>
        </div>
      ) : (
        /* Cart content: items + summary */
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4">
            {/* Items list */}
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <CartItemFull
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>

            {/* Summary sidebar */}
            <div className="flex flex-col gap-3">
              <CartTotals items={items} currencyCode={currencyCode} />

              <Button
                variant="primary"
                size="small"
                className="w-full"
                disabled={isPlacingOrder || items.length === 0}
                onClick={() => {
                  placeOrder({
                    items: items.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                      title: i.title,
                    })),
                  });
                  clearCart();
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
                Empty Cart
              </Button>

              <Button
                variant="secondary"
                size="small"
                className="w-full"
                onClick={() =>
                  sendFollowUpMessage("Search for all available products")
                }
              >
                <ChatBubble className="w-3.5 h-3.5" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CartWidget: React.FC = () => {
  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <CartProvider>
          <CartWidgetInner />
        </CartProvider>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
};

export default CartWidget;
