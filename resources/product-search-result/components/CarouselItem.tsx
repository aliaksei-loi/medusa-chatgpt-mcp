import React from "react";
import { Image } from "mcp-use/react";
import type { Product } from "../types";

export interface CarouselItemProps {
  product: Product;
  isFavorite?: boolean;
  onClick: () => void;
  onToggleFavorite?: () => void;
  onAddToCart?: (product: Product) => void;
}

function formatPrice(amount: number | null, currencyCode: string): string {
  if (amount === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

function ShoppingBag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="#fff"
    >
      <g clipPath="url(#clip0_bag)">
        <path
          d="M11.696 8.392L10.972 2.892C10.792 1.529 9.62003 0.501 8.24503 0.501H3.75403C2.37903 0.5 1.20803 1.528 1.02703 2.892L0.303034 8.392C0.199034 9.177 0.440034 9.969 0.962034 10.564C1.48403 11.16 2.23803 11.501 3.03003 11.501H8.96903C9.76103 11.501 10.514 11.16 11.037 10.564C11.559 9.969 11.799 9.176 11.696 8.392ZM6.00003 6.5C4.48303 6.5 3.25003 5.267 3.25003 3.75C3.25003 3.336 3.58603 3 4.00003 3C4.41403 3 4.75003 3.336 4.75003 3.75C4.75003 4.439 5.31103 5 6.00003 5C6.68903 5 7.25003 4.439 7.25003 3.75C7.25003 3.336 7.58603 3 8.00003 3C8.41403 3 8.75003 3.336 8.75003 3.75C8.75003 5.267 7.51703 6.5 6.00003 6.5Z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="clip0_bag">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function getStockColor(quantity: number): string {
  if (quantity > 50) return "text-green-500";
  if (quantity > 0) return "text-orange-500";
  return "text-red-500";
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  product,
  onClick,
  onAddToCart,
}) => {
  const inventoryQuantity = product.inventory_quantity ?? 0;

  return (
    <div
      className="carousel-item w-44 min-w-44 rounded-lg bg-white cursor-pointer flex flex-col overflow-hidden mt-1"
      style={{
        // aspectRatio: "3/5",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
    >
      {/* Product thumbnail */}
      <div className="carousel-item-bg">
        {product.thumbnail && (
          <Image src={product.thumbnail} alt={product.title} />
        )}
      </div>
      <div className="carousel-item-content p-6">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            className="object-contain"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center text-neutral-400 text-3xl">
            ?
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="relative z-10 flex flex-col gap-2 p-3 pt-0 mt-auto">
        <div className="flex flex-col">
          <span className="text-neutral-500 text-[0.55rem] uppercase tracking-wide">
            {product.collection ?? "BRAND"}
          </span>
          <span className="text-neutral-900 text-xs font-medium truncate">
            {product.title}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-neutral-950 font-semibold text-sm">
            {formatPrice(product.price, product.currency_code)}
          </span>
          <span className="text-neutral-500 text-[0.5rem]">Excl. VAT</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className={`text-xs ${getStockColor(inventoryQuantity)}`}>
              •
            </span>
            <span className="text-neutral-500 text-[0.55rem]">
              {inventoryQuantity} left
            </span>
          </div>
          <button
            className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          >
            <ShoppingBag />
          </button>
        </div>
      </div>
    </div>
  );
};
