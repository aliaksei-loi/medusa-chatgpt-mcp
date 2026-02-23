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
import type { ProductSearchResultProps } from "./types";
import { propSchema } from "./types";

import { Badge } from "@medusajs/ui";
import { Button } from "@medusajs/ui";
import { Container } from "@medusajs/ui";
import { Heading } from "@medusajs/ui";
import { IconButton } from "@medusajs/ui";
import { Text } from "@medusajs/ui";
import {
  ArrowsPointingOutMini,
  Heart,
  XMarkMini,
  ChatBubble,
  SquareTwoStackMini,
} from "@medusajs/icons";

export const widgetMetadata: WidgetMetadata = {
  description:
    "Display product search results with filtering, state management, and tool interactions",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: false,
    invoking: "Loading product search results...",
    invoked: "Product search results loaded",
    csp: {
      resourceDomains: ["https://cdn.openai.com"],
    },
  },
};
type FavoritesState = { favorites: string[] };

const ProductSearchResult: React.FC = () => {
  const {
    props,
    isPending,
    displayMode,
    requestDisplayMode,
    sendFollowUpMessage,
    locale,
    state,
    setState,
  } = useWidget<ProductSearchResultProps, FavoritesState>();

  const {
    callTool: getFruitDetails,
    data: fruitDetails,
    isPending: isLoadingDetails,
  } = useCallTool("get-fruit-details");

  const selectedFruit = fruitDetails?.structuredContent as
    | { fruit: string; facts?: string[] }
    | undefined;
  const favorites = state?.favorites ?? [];

  const toggleFavorite = useCallback(
    (fruit: string) => {
      const current = state?.favorites ?? [];
      const next = current.includes(fruit)
        ? current.filter((f: string) => f !== fruit)
        : [...current, fruit];
      setState({ favorites: next });
    },
    [state, setState],
  );

  const accordionItems = [
    {
      question: "Demo of the autosize feature",
      answer:
        "This is a demo of the autosize feature. The widget will automatically resize to fit the content, as supported by the mcp-apps specification",
    },
  ];

  if (isPending) {
    return (
      <McpUseProvider>
        <div className="relative bg-surface-elevated border border-default rounded-3xl">
          <div className="p-8 pb-4">
            <Text size="small" className="text-secondary mb-1">
              MCP-Apps Template
            </Text>
            <Heading level="h2" className="mb-3">
              Lovely Little Fruit Shop
            </Heading>
            <div className="h-5 w-48 rounded-md bg-default/10 animate-pulse" />
          </div>
          <CarouselSkeleton />
        </div>
      </McpUseProvider>
    );
  }

  const { query, results } = props;
  const isFullscreen = displayMode === "fullscreen";
  const isPip = displayMode === "pip";
  const lang = locale?.split("-")[0] ?? "en";

  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <div className="relative bg-surface-elevated border border-default rounded-3xl">
          {/* Toolbar — top-right badges and controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {/* Locale badge */}
            <Badge color="grey" size="small" rounded="full">
              {lang.toUpperCase()}
            </Badge>

            {/* Favorites count */}
            {favorites.length > 0 && (
              <Badge color="red" size="small" rounded="full">
                <Heart fill="red" />
                {favorites.length}
              </Badge>
            )}

            {/* Display mode buttons */}
            {!isFullscreen && !isPip && (
              <>
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => requestDisplayMode("pip")}
                  title="Picture-in-picture"
                >
                  <SquareTwoStackMini />
                </IconButton>
                <IconButton
                  variant="transparent"
                  size="small"
                  onClick={() => requestDisplayMode("fullscreen")}
                  title="Fullscreen"
                >
                  <ArrowsPointingOutMini />
                </IconButton>
              </>
            )}

            {(isFullscreen || isPip) && (
              <IconButton
                variant="transparent"
                size="small"
                onClick={() => requestDisplayMode("inline")}
                title="Exit"
              >
                <XMarkMini />
              </IconButton>
            )}
          </div>

          {/* Header */}
          <div className="p-8 pb-4">
            <Text size="small" className="text-secondary mb-1">
              MCP-Apps Template
            </Text>
            <Heading level="h2" className="mb-1">
              Lovely Little Fruit Shop
            </Heading>
            <Text size="base" className="text-secondary">
              {query
                ? `Showing results for "${query}"`
                : "Tap a fruit to see details"}
            </Text>
          </div>

          {/* Carousel */}
          <Carousel
            results={results}
            favorites={favorites}
            onSelectFruit={(fruit: string) => getFruitDetails({ fruit })}
            onToggleFavorite={toggleFavorite}
          />

          {/* Detail view */}
          {selectedFruit && (
            <Container className="mx-8 my-6 flex items-center gap-6">
              <div
                className={`rounded-xl p-4 shrink-0 ${
                  results.find(
                    (r: { fruit: string }) => r.fruit === selectedFruit.fruit,
                  )?.color ?? ""
                }`}
              >
                <Image
                  src={`/fruits/${selectedFruit.fruit}.png`}
                  alt={selectedFruit.fruit}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div className="flex-1">
                {isLoadingDetails ? (
                  <div className="animate-pulse h-4 w-32 bg-surface-elevated rounded" />
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Heading level="h3" className="capitalize">
                        {selectedFruit.fruit}
                      </Heading>
                      <IconButton
                        variant="transparent"
                        size="small"
                        onClick={() => toggleFavorite(selectedFruit.fruit)}
                        title={
                          favorites.includes(selectedFruit.fruit)
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        {favorites.includes(selectedFruit.fruit) ? (
                          <Heart fill="red" />
                        ) : (
                          <Heart />
                        )}
                      </IconButton>
                    </div>
                    <ul className="space-y-1">
                      {(selectedFruit.facts ?? []).map((fact: string) => (
                        <li key={fact} className="flex items-start gap-2">
                          <Text size="small" className="text-secondary">
                            <span className="text-blue-500 mr-1">&bull;</span>
                            {fact}
                          </Text>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="secondary"
                      size="small"
                      className="mt-3"
                      onClick={() =>
                        sendFollowUpMessage(
                          `Tell me more interesting facts about ${selectedFruit.fruit}`,
                        )
                      }
                    >
                      <ChatBubble className="w-3.5 h-3.5" />
                      Ask the AI for more about {selectedFruit.fruit}
                    </Button>
                  </>
                )}
              </div>
            </Container>
          )}

          <Accordion items={accordionItems} />
        </div>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
};

export default ProductSearchResult;
