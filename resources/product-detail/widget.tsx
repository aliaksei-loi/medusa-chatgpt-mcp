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

function ShoppingBagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="#fff"
    >
      <g clipPath="url(#clip0_detail_bag)">
        <path
          d="M11.696 8.392L10.972 2.892C10.792 1.529 9.62003 0.501 8.24503 0.501H3.75403C2.37903 0.5 1.20803 1.528 1.02703 2.892L0.303034 8.392C0.199034 9.177 0.440034 9.969 0.962034 10.564C1.48403 11.16 2.23803 11.501 3.03003 11.501H8.96903C9.76103 11.501 10.514 11.16 11.037 10.564C11.559 9.969 11.799 9.176 11.696 8.392ZM6.00003 6.5C4.48303 6.5 3.25003 5.267 3.25003 3.75C3.25003 3.336 3.58603 3 4.00003 3C4.41403 3 4.75003 3.336 4.75003 3.75C4.75003 4.439 5.31103 5 6.00003 5C6.68903 5 7.25003 4.439 7.25003 3.75C7.25003 3.336 7.58603 3 8.00003 3C8.41403 3 8.75003 3.336 8.75003 3.75C8.75003 5.267 7.51703 6.5 6.00003 6.5Z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="clip0_detail_bag">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

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
      if (!props?.id) return;
      const v = variant ?? props.variants?.[0];
      const price = v?.prices?.[0];
      const item = {
        productId: props.id ?? "",
        variantId: v?.id ?? null,
        title: props.title ?? "",
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
