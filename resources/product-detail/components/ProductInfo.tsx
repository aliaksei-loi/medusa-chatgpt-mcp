import React from "react";
import { Heading, Text, Badge } from "@medusajs/ui";
import {
  CheckCircleSolid,
  ExclamationCircleSolid,
} from "@medusajs/icons";
import type { ProductDetail } from "../types";

interface ProductInfoProps {
  product: ProductDetail;
}

function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
}

function getCheapestPrice(product: ProductDetail): {
  amount: number;
  currency_code: string;
} | null {
  let cheapest: number | null = null;
  let currency = "usd";

  for (const variant of product.variants) {
    for (const price of variant.prices) {
      if (cheapest === null || price.amount < cheapest) {
        cheapest = price.amount;
        currency = price.currency_code;
      }
    }
  }

  return cheapest !== null ? { amount: cheapest, currency_code: currency } : null;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const cheapestPrice = getCheapestPrice(product);
  const inventoryQuantity = product.variants.reduce(
    (acc, v) => acc + v.inventory_quantity,
    0
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Title */}
      <div className="flex flex-col gap-1">
        {product.collection && (
          <Text className="text-neutral-500 text-xs uppercase tracking-wide">
            {product.collection}
          </Text>
        )}
        <Heading
          level="h1"
          className="text-2xl leading-tight text-neutral-950"
        >
          {product.title}
        </Heading>
        {product.description && (
          <Text className="text-neutral-600 text-sm mt-1 line-clamp-3">
            {product.description}
          </Text>
        )}
      </div>

      {/* Price */}
      {cheapestPrice && (
        <div className="flex flex-col">
          <Text className="font-semibold text-xl text-neutral-950">
            From {formatPrice(cheapestPrice.amount, cheapestPrice.currency_code)}
          </Text>
          <Text className="text-neutral-500 text-[0.6rem]">Excl. VAT</Text>
        </div>
      )}

      {/* Stock facts */}
      <div className="flex flex-col gap-1.5">
        {inventoryQuantity > 10 ? (
          <span className="flex items-center gap-2 text-neutral-600 text-sm">
            <CheckCircleSolid className="text-green-500 w-4 h-4 shrink-0" />
            Can be shipped immediately ({inventoryQuantity} in stock)
          </span>
        ) : inventoryQuantity > 0 ? (
          <span className="flex items-center gap-2 text-neutral-600 text-sm">
            <ExclamationCircleSolid className="text-orange-500 w-4 h-4 shrink-0" />
            Limited quantity available ({inventoryQuantity} in stock)
          </span>
        ) : (
          <span className="flex items-center gap-2 text-neutral-600 text-sm">
            <ExclamationCircleSolid className="text-red-500 w-4 h-4 shrink-0" />
            Out of stock
          </span>
        )}
      </div>

      {/* Options */}
      {product.options.length > 0 && (
        <div className="flex flex-col gap-2">
          {product.options
            .filter((opt) => opt.title !== "Default option")
            .map((opt) => (
              <div key={opt.title}>
                <Text className="text-neutral-950 text-sm font-medium mb-1">
                  {opt.title}
                </Text>
                <div className="flex flex-wrap gap-1.5">
                  {opt.values.map((val) => (
                    <span
                      key={val}
                      className="px-3 py-1 text-xs border border-neutral-200 rounded-full text-neutral-700 bg-white"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <Badge key={tag} color="blue" size="small" rounded="full">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
