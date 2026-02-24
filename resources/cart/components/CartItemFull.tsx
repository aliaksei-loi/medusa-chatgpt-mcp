import React from "react";
import { Image } from "mcp-use/react";
import { Container, Text } from "@medusajs/ui";
import { XMarkMini } from "@medusajs/icons";
import type { CartWidgetItem } from "../types";

interface CartItemFullProps {
  item: CartWidgetItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

function formatPrice(amount: number | null, currencyCode: string): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

export const CartItemFull: React.FC<CartItemFullProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
}) => {
  return (
    <Container className="flex gap-4 w-full items-center justify-between">
      <div className="flex gap-x-4 items-start">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <span className="text-neutral-400 text-2xl">?</span>
          )}
        </div>

        {/* Product info & controls */}
        <div className="flex flex-col gap-y-2 justify-between">
          <div className="flex flex-col">
            <span className="text-neutral-500 text-[0.6rem] uppercase">
              BRAND
            </span>
            <span className="text-neutral-950 text-sm font-medium">
              {item.title}
            </span>
            {item.variantTitle && (
              <span className="text-neutral-500 text-xs">
                {item.variantTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity controls — pill style like storefront */}
            <div className="flex items-center gap-0 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full px-1">
              <button
                className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-sm"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className="w-8 text-center text-neutral-950 text-xs">
                {item.quantity}
              </span>
              <button
                className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-full text-sm"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>

            {/* Delete button */}
            <button
              className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-full transition-colors"
              onClick={() => onRemove(item.id)}
              title="Remove item"
            >
              <XMarkMini className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Price column */}
      <div className="flex flex-col items-end shrink-0">
        <Text className="text-neutral-950 font-medium text-sm">
          {formatPrice(
            item.price !== null ? item.price * item.quantity : null,
            item.currencyCode
          )}
        </Text>
        {item.quantity > 1 && item.price !== null && (
          <Text className="text-neutral-400 text-xs">
            {formatPrice(item.price, item.currencyCode)} each
          </Text>
        )}
      </div>
    </Container>
  );
};
