import { Animate } from "@openai/apps-sdk-ui/components/Transition";
import React, { useRef } from "react";
import { CarouselItem } from "./CarouselItem";
import { useCarouselAnimation } from "../hooks/useCarouselAnimation";
import type { Product } from "../types";

interface CarouselProps {
  results: Product[];
  favorites?: string[];
  onSelectProduct: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  results,
  favorites = [],
  onSelectProduct,
  onToggleFavorite,
  onAddToCart,
}) => {
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useCarouselAnimation(carouselContainerRef, scrollContainerRef);

  return (
    <div
      ref={scrollContainerRef}
      className="carousel-scroll-container w-full overflow-x-auto overflow-y-visible pl-8"
    >
      <div ref={carouselContainerRef} className="overflow-visible">
        <Animate className="flex gap-4">
          {results.map((product, index) => (
            <CarouselItem
              key={product.id ?? index}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onClick={() => onSelectProduct(product.id)}
              onToggleFavorite={
                onToggleFavorite
                  ? () => onToggleFavorite(product.id)
                  : undefined
              }
              onAddToCart={onAddToCart}
            />
          ))}
        </Animate>
      </div>
    </div>
  );
};
