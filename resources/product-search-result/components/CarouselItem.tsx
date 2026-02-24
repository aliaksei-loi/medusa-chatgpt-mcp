import { IconButton } from "@medusajs/ui";
import { Heart } from "@medusajs/icons";
import { Image } from "mcp-use/react";
import React from "react";
import type { Product } from "../types";

export interface CarouselItemProps {
  product: Product;
  isFavorite?: boolean;
  onClick: () => void;
  onToggleFavorite?: () => void;
}

function formatPrice(amount: number | null, currencyCode: string): string {
  if (amount === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  product,
  isFavorite,
  onClick,
  onToggleFavorite,
}) => {
  return (
    <div
      className="carousel-item w-44 min-w-44 rounded-xl border border-subtle bg-surface-base cursor-pointer flex flex-col overflow-hidden"
      onClick={onClick}
    >
      {onToggleFavorite && (
        <IconButton
          variant="transparent"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-2 right-2 z-10 ${isFavorite ? "text-red-500" : ""}`}
        >
          {isFavorite ? <Heart fill="red" /> : <Heart />}
        </IconButton>
      )}
      {/* Product thumbnail */}
      <div className="carousel-item-bg">
        {product.thumbnail && (
          <Image src={product.thumbnail} alt={product.title} />
        )}
      </div>
      <div className="carousel-item-content">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            className="object-contain"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center text-tertiary text-3xl">
            ?
          </div>
        )}
      </div>
      {/* Product info overlay at bottom */}
      <div className="relative z-10 p-2.5 pt-0">
        <p className="text-xs font-medium text-default truncate">
          {product.title}
        </p>
        <p className="text-xs text-secondary">
          {formatPrice(product.price, product.currency_code)}
        </p>
      </div>
    </div>
  );
};
