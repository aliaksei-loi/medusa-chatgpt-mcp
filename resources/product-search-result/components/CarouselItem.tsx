import React from "react";
import { Image } from "mcp-use/react";
import type { Product } from "../types";
import { formatPrice } from "../../shared/formatPrice";
import { ShoppingBagIcon } from "../../shared/ShoppingBagIcon";

export interface CarouselItemProps {
  product: Product;
  onClick: () => void;
  onAddToCart?: (product: Product) => void;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  product,
  onClick,
  onAddToCart,
}) => {
  return (
    <div
      className="carousel-item w-44 min-w-44 rounded-lg bg-white cursor-pointer flex flex-col overflow-hidden mt-1"
      role="button"
      tabIndex={0}
      style={{
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Product thumbnail */}
      <div className="carousel-item-bg" aria-hidden="true">
        {product.thumbnail && (
          <Image src={product.thumbnail} alt="" />
        )}
      </div>
      <div
        className="carousel-item-content p-6"
        style={{ height: "150px", flex: "none" }}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            className="object-contain"
            style={{ maxHeight: "100%", maxWidth: "100%" }}
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

        <div className="flex justify-end items-center">
          <button
            className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            aria-label={`Add ${product.title} to cart`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          >
            <ShoppingBagIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
