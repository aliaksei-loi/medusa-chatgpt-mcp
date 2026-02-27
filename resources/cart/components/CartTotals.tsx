import React from "react";
import { Container, Text } from "@medusajs/ui";
import type { CartWidgetItem } from "../types";
import { formatPrice } from "../../shared/formatPrice";

interface CartTotalsProps {
  items: CartWidgetItem[];
  currencyCode: string;
}

export const CartTotals: React.FC<CartTotalsProps> = ({
  items,
  currencyCode,
}) => {
  const subtotal = items.reduce(
    (acc, i) => acc + (i.price ?? 0) * i.quantity,
    0
  );
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Container className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-2 text-sm text-neutral-600">
        <div className="flex items-center justify-between">
          <Text className="text-neutral-600 text-sm">
            Subtotal (excl. shipping and taxes)
          </Text>
          <Text className="text-neutral-950 text-sm">
            {formatPrice(subtotal, currencyCode)}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text className="text-neutral-600 text-sm">Shipping</Text>
          <Text className="text-neutral-500 text-sm">Calculated at checkout</Text>
        </div>
        <div className="flex items-center justify-between">
          <Text className="text-neutral-600 text-sm">Taxes</Text>
          <Text className="text-neutral-500 text-sm">Calculated at checkout</Text>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
        <Text className="text-neutral-950 font-medium">Total</Text>
        <Text className="text-neutral-950 font-semibold text-lg">
          {formatPrice(subtotal, currencyCode)}
        </Text>
      </div>

      <Text className="text-neutral-400 text-xs">
        Total: {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
      </Text>
    </Container>
  );
};
