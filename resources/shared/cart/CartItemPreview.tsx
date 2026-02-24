import React from "react";
import { Image } from "mcp-use/react";
import { XMarkMini } from "@medusajs/icons";
import type { CartItem } from "./types";

interface CartItemPreviewProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

function formatPrice(amount: number | null, currencyCode: string): string {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

export const CartItemPreview: React.FC<CartItemPreviewProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
}) => {
  return (
    <div className="flex gap-3 items-center py-2">
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <span className="text-neutral-400 text-sm">?</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-neutral-950 text-sm font-medium truncate block">
          {item.title}
        </span>
        {item.variantTitle && (
          <span className="text-neutral-500 text-xs block">
            {item.variantTitle}
          </span>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          className="w-5 h-5 rounded text-xs bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          −
        </button>
        <span className="text-xs text-neutral-700 w-5 text-center">
          {item.quantity}
        </span>
        <button
          className="w-5 h-5 rounded text-xs bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end shrink-0">
        <span className="text-neutral-950 text-xs font-medium">
          {formatPrice(
            item.price !== null ? item.price * item.quantity : null,
            item.currencyCode
          )}
        </span>
      </div>

      {/* Remove */}
      <button
        className="text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
        onClick={() => onRemove(item.id)}
      >
        <XMarkMini className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
