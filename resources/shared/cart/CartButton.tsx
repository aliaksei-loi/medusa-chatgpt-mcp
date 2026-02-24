import React from "react";
import { useCart } from "./CartContext";

function ShoppingBagIcon({ fill = "#52525B" }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill={fill}
    >
      <g clipPath="url(#clip0_cart_btn)">
        <path
          d="M11.696 8.392L10.972 2.892C10.792 1.529 9.62003 0.501 8.24503 0.501H3.75403C2.37903 0.5 1.20803 1.528 1.02703 2.892L0.303034 8.392C0.199034 9.177 0.440034 9.969 0.962034 10.564C1.48403 11.16 2.23803 11.501 3.03003 11.501H8.96903C9.76103 11.501 10.514 11.16 11.037 10.564C11.559 9.969 11.799 9.176 11.696 8.392ZM6.00003 6.5C4.48303 6.5 3.25003 5.267 3.25003 3.75C3.25003 3.336 3.58603 3 4.00003 3C4.41403 3 4.75003 3.336 4.75003 3.75C4.75003 4.439 5.31103 5 6.00003 5C6.68903 5 7.25003 4.439 7.25003 3.75C7.25003 3.336 7.58603 3 8.00003 3C8.41403 3 8.75003 3.336 8.75003 3.75C8.75003 5.267 7.51703 6.5 6.00003 6.5Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_cart_btn">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

export const CartButton: React.FC = () => {
  const { totalItems, subtotal, currencyCode, toggleCart } = useCart();

  return (
    <button
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-neutral-100 transition-colors"
      onClick={toggleCart}
      title="Shopping Cart"
    >
      <ShoppingBagIcon />
      <span className="text-xs font-normal text-neutral-700 hidden sm:inline">
        {totalItems > 0 ? formatPrice(subtotal, currencyCode) : "Cart"}
      </span>
      <span className="bg-blue-500 text-white text-[0.6rem] leading-none px-1.5 py-0.5 rounded-full min-w-[1.1rem] text-center">
        {totalItems}
      </span>
    </button>
  );
};
