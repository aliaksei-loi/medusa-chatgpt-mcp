import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import {
  Image,
  McpUseProvider,
  useCallTool,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useCallback } from "react";
import { Link } from "react-router";
import "../styles.css";
import { Carousel } from "./components/Carousel";
import { CarouselSkeleton } from "./components/CarouselSkeleton";
import { Accordion } from "./components/Accordion";
import type { Product, ProductSearchResultProps } from "./types";
import { propSchema } from "./types";
import type { ProductDetail } from "../product-detail/types";
import { formatPrice } from "../shared/formatPrice";

import { CartProvider, useCart, CartButton, CartDrawer } from "../shared/cart";

import {
  Badge,
  Button,
  Container,
  Heading,
  IconButton,
  Text,
} from "@medusajs/ui";

import {
  ArrowsPointingOutMini,
  Heart,
  XMarkMini,
  ChatBubble,
  SquareTwoStackMini,
} from "@medusajs/icons";

export const widgetMetadata: WidgetMetadata = {
  description:
    "Display Medusa product search results with filtering, state management, and tool interactions",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Searching products...",
    invoked: "Products loaded",
    csp: {
      resourceDomains: ["https://cdn.openai.com"],
    },
  },
};

type WidgetState = {
  favorites: string[];
};

const ProductSearchResultInner: React.FC = () => {
  const {
    props,
    isPending,
    displayMode,
    requestDisplayMode,
    sendFollowUpMessage,
    locale,
    state,
    setState,
  } = useWidget<ProductSearchResultProps, WidgetState>();

  const {
    callTool: getProductDetails,
    data: productDetailsData,
    isPending: isLoadingDetails,
  } = useCallTool("get-product-details");

  const { addItem } = useCart();
  const { callTool: callAddToCart } = useCallTool("add-to-cart");

  const selectedProduct = productDetailsData?.structuredContent as
    | ProductDetail
    | undefined;

  const favorites = state?.favorites ?? [];

  const toggleFavorite = useCallback(
    (productId: string) => {
      const current = state?.favorites ?? [];
      const next = current.includes(productId)
        ? current.filter((id: string) => id !== productId)
        : [...current, productId];
      setState({ favorites: next });
    },
    [state, setState],
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      const item = {
        productId: product.id,
        variantId: product.default_variant_id,
        title: product.title,
        variantTitle: null,
        thumbnail: product.thumbnail,
        quantity: 1,
        price: product.price,
        currencyCode: product.currency_code,
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
    [addItem, callAddToCart],
  );

  // Add to cart from the detail view (uses first variant)
  const handleDetailAddToCart = useCallback(() => {
    if (!selectedProduct) return;
    const firstVariant = selectedProduct.variants?.[0];
    const price = firstVariant?.prices?.[0];
    const item = {
      productId: selectedProduct.id,
      variantId: firstVariant?.id ?? null,
      title: selectedProduct.title,
      variantTitle: firstVariant?.title ?? null,
      thumbnail: selectedProduct.thumbnail,
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
  }, [selectedProduct, addItem, callAddToCart]);

  if (isPending) {
    return (
      <div className="relative bg-surface-elevated border border-default rounded-3xl">
        <div className="p-8 pb-4">
          <Text size="small" className="text-secondary mb-1">
            Medusa Store
          </Text>
          <Heading level="h2" className="mb-3">
            Products
          </Heading>
          <div className="h-5 w-48 rounded-md bg-default/10 animate-pulse" />
        </div>
        <CarouselSkeleton />
      </div>
    );
  }

  const { query, results } = props;
  const isFullscreen = displayMode === "fullscreen";

  return (
    <div className="relative bg-surface-elevated border border-default rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <CartButton />

        {favorites.length > 0 && (
          <Badge color="red" size="small" rounded="full">
            <Heart fill="red" />
            {favorites.length}
          </Badge>
        )}

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

      <div className="p-8 pb-4">
        <Heading level="h2" className="mb-1">
          Medusa Store
        </Heading>

        <Text size="base" className="text-secondary">
          {query
            ? `Showing results for "${query}" (${results.length} found)`
            : `Browse all products (${results.length})`}
        </Text>
      </div>

      {/* Product carousel */}
      {results.length > 0 ? (
        <Carousel
          results={results}
          favorites={favorites}
          onSelectProduct={(productId: string) =>
            getProductDetails({ product_id: productId })
          }
          onToggleFavorite={toggleFavorite}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <div className="px-8 py-12 text-center">
          <Text size="base" className="text-tertiary">
            No products found
            {query ? ` for "${query}"` : ""}
          </Text>
        </div>
      )}

      {/* Product detail view */}
      {selectedProduct && (
        <Container>
          <div className="flex items-start gap-6">
            {/* Product image */}
            <div className="rounded-xl overflow-hidden shrink-0 bg-surface-base border border-subtle">
              {selectedProduct.thumbnail ? (
                <Image
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.title}
                  className="w-28 h-28 object-contain p-2"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center text-tertiary text-4xl">
                  ?
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              {isLoadingDetails ? (
                <div className="space-y-2">
                  <div className="animate-pulse h-5 w-40 bg-surface-elevated rounded" />
                  <div className="animate-pulse h-4 w-64 bg-surface-elevated rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Heading level="h3">{selectedProduct.title}</Heading>
                    <IconButton
                      variant="transparent"
                      size="small"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      title={
                        favorites.includes(selectedProduct.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      {favorites.includes(selectedProduct.id) ? (
                        <Heart fill="red" />
                      ) : (
                        <Heart />
                      )}
                    </IconButton>
                  </div>

                  {selectedProduct.collection && (
                    <Badge
                      color="grey"
                      size="small"
                      rounded="full"
                      className="mb-2"
                    >
                      {selectedProduct.collection}
                    </Badge>
                  )}

                  {selectedProduct.description && (
                    <Text
                      size="small"
                      className="text-secondary mb-3 line-clamp-2"
                    >
                      {selectedProduct.description}
                    </Text>
                  )}

                  {/* Variants & Pricing */}
                  {selectedProduct.variants.length > 0 && (
                    <div className="mb-3">
                      <Text
                        size="small"
                        weight="plus"
                        className="text-default mb-1"
                      >
                        Variants ({selectedProduct.variants.length})
                      </Text>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.variants.map((v) => {
                          const price = v.prices[0];
                          return (
                            <Badge
                              key={v.id}
                              color="grey"
                              size="small"
                              rounded="full"
                            >
                              {v.title}
                              {price
                                ? ` · ${formatPrice(price.amount, price.currency_code)}`
                                : ""}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  {selectedProduct.options.length > 0 && (
                    <div className="mb-3">
                      {selectedProduct.options.map((opt) => (
                        <div key={opt.title} className="mb-1">
                          <Text
                            size="small"
                            weight="plus"
                            className="text-default"
                          >
                            {opt.title}:
                          </Text>
                          <Text size="small" className="text-secondary ml-1">
                            {opt.values.join(", ")}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {selectedProduct.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {selectedProduct.tags.map((tag) => (
                        <Badge
                          key={tag}
                          color="blue"
                          size="small"
                          rounded="full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleDetailAddToCart}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        sendFollowUpMessage(
                          `Show me full details for product "${selectedProduct.title}" (product ID: ${selectedProduct.id})`,
                        )
                      }
                    >
                      <SquareTwoStackMini className="w-4 h-4" />
                      Open full details
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() =>
                        sendFollowUpMessage(
                          `Tell me more about the product "${selectedProduct.title}"`,
                        )
                      }
                    >
                      <ChatBubble className="w-4 h-4" />
                      Ask AI
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

const ProductSearchResult: React.FC = () => {
  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <CartProvider>
          <ProductSearchResultInner />
        </CartProvider>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
};

export default ProductSearchResult;
