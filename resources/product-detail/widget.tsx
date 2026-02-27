import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import {
  McpUseProvider,
  useCallTool,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useCallback } from "react";
import { Link } from "react-router";
import "../styles.css";
import { productDetailSchema } from "./types";
import type { ProductDetail, Variant } from "./types";
import { ImageGallery } from "./components/ImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { VariantsTable } from "./components/VariantsTable";
import { ProductTabs } from "./components/ProductTabs";

import { CartProvider, useCart, CartButton, CartDrawer } from "../shared/cart";
import { ShoppingBagIcon } from "../shared/ShoppingBagIcon";

import {
  Button,
  Heading,
  IconButton,
  Text,
} from "@medusajs/ui";

import {
  ArrowsPointingOutMini,
  XMarkMini,
  ChatBubble,
} from "@medusajs/icons";

export const widgetMetadata: WidgetMetadata = {
  description: "Display detailed product information with image gallery, pricing, variants, and specifications",
  props: productDetailSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Loading product details...",
    invoked: "Product loaded",
    csp: {
      resourceDomains: ["https://cdn.openai.com"],
    },
  },
};

const ProductDetailInner: React.FC = () => {
  const {
    props,
    isPending,
    displayMode,
    requestDisplayMode,
    sendFollowUpMessage,
  } = useWidget<ProductDetail>();

  const { addItem } = useCart();
  const { callTool: callAddToCart } = useCallTool("add-to-cart");

  const handleAddToCart = useCallback(
    (variant?: Variant) => {
      if (!props?.id || !props.title) return;
      const v = variant ?? props.variants?.[0];
      const price = v?.prices?.[0];
      const item = {
        productId: props.id,
        variantId: v?.id ?? null,
        title: props.title,
        variantTitle: v?.title ?? null,
        thumbnail: props.thumbnail ?? null,
        quantity: 1,
        price: price?.amount ?? null,
        currencyCode: price?.currency_code ?? "usd",
      };
      addItem(item);
      callAddToCart({
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        price: item.price,
        currencyCode: item.currencyCode,
      });
    },
    [props, addItem, callAddToCart],
  );

  if (isPending) {
    return (
      <div className="relative bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="h-6 w-48 rounded-md bg-neutral-100 animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-neutral-100 rounded-lg animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-8 w-64 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
              <div className="h-6 w-32 bg-neutral-100 rounded animate-pulse mt-4" />
              <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const product = props;
  const isFullscreen = displayMode === "fullscreen";

  return (
    <div className="relative bg-white border border-neutral-200 rounded-2xl">
      {/* Header controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <CartButton />

        {isFullscreen ? (
          <IconButton
            variant="transparent"
            size="small"
            onClick={() => requestDisplayMode("inline")}
            title="Exit"
            aria-label="Exit fullscreen"
          >
            <XMarkMini />
          </IconButton>
        ) : (
          <IconButton
            variant="transparent"
            size="small"
            onClick={() => requestDisplayMode("fullscreen")}
            title="Fullscreen"
            aria-label="Enter fullscreen"
          >
            <ArrowsPointingOutMini />
          </IconButton>
        )}
      </div>

      {/* Main content — 2-column grid like storefront */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-t-2xl">
        {/* Left: Image Gallery */}
        <ImageGallery
          thumbnail={product.thumbnail}
          images={product.images}
          title={product.title}
        />

        {/* Right: Product Info */}
        <div className="flex flex-col gap-6 p-6 md:p-8 justify-center">
          <ProductInfo product={product} />

          {/* Add to cart button */}
          <Button
            variant="primary"
            size="large"
            className="w-full"
            onClick={() => handleAddToCart()}
            disabled={product.variants.length === 0}
          >
            <ShoppingBagIcon />
            {product.variants.length === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Variants Table */}
      <div className="px-6 pb-4">
        <VariantsTable product={product} />
      </div>

      {/* Tabs (Description & Specifications) */}
      <div className="px-6 pb-4">
        <ProductTabs product={product} />
      </div>

      {/* Action button */}
      <div className="px-6 pb-6">
        <Button
          variant="secondary"
          size="small"
          className="w-full"
          onClick={() =>
            sendFollowUpMessage(
              `Tell me more about the product "${product.title}"`
            )
          }
        >
          <ChatBubble className="w-3.5 h-3.5" />
          Ask AI about {product.title}
        </Button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

const ProductDetailWidget: React.FC = () => {
  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <CartProvider>
          <ProductDetailInner />
        </CartProvider>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
};

export default ProductDetailWidget;
