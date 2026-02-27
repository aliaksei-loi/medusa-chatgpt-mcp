import React from "react";
import { useCart } from "./CartContext";
import { ShoppingBagIcon } from "../ShoppingBagIcon";
import { formatPrice } from "../formatPrice";

export const CartButton: React.FC = () => {
  const { totalItems, subtotal, currencyCode, toggleCart } = useCart();

  return (
    <button
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-neutral-100 transition-colors"
      onClick={toggleCart}
      title="Shopping Cart"
    >
      <ShoppingBagIcon size={14} fill="#52525B" />
      <span className="text-xs font-normal text-neutral-700 hidden sm:inline">
        {totalItems > 0 ? formatPrice(subtotal, currencyCode) : "Cart"}
      </span>
      <span className="bg-blue-500 text-white text-[0.6rem] leading-none px-1.5 py-0.5 rounded-full min-w-[1.1rem] text-center">
        {totalItems}
      </span>
    </button>
  );
};
