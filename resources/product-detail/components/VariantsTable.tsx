import React from "react";
import { Table, Text } from "@medusajs/ui";
import type { ProductDetail } from "../types";
import { formatPrice } from "../../shared/formatPrice";
import { getStockColor } from "../../shared/getStockColor";

interface VariantsTableProps {
  product: ProductDetail;
}

export const VariantsTable: React.FC<VariantsTableProps> = ({ product }) => {
  if (product.variants.length === 0) return null;

  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <Text className="text-neutral-950 font-medium text-sm">
        Variants ({product.variants.length})
      </Text>
      <div className="overflow-x-auto">
        <Table className="w-full rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.06)] border-none">
          <Table.Header className="border-t-0">
            <Table.Row className="bg-neutral-100 border-none hover:!bg-neutral-100">
              {hasMultipleVariants && (
                <Table.HeaderCell className="px-3 text-xs">
                  SKU
                </Table.HeaderCell>
              )}
              <Table.HeaderCell className="px-3 text-xs">
                Variant
              </Table.HeaderCell>
              <Table.HeaderCell className="px-3 text-xs border-x border-neutral-200">
                Price
              </Table.HeaderCell>
              <Table.HeaderCell className="px-3 text-xs">
                Stock
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body className="border-none">
            {product.variants.map((variant, index) => {
              const price = variant.prices[0];
              return (
                <Table.Row
                  key={variant.id}
                  className={
                    index === product.variants.length - 1 ? "border-b-0" : ""
                  }
                >
                  {hasMultipleVariants && (
                    <Table.Cell className="px-3 text-xs text-neutral-500">
                      {variant.sku || "—"}
                    </Table.Cell>
                  )}
                  <Table.Cell className="px-3 text-xs text-neutral-900">
                    {variant.title}
                  </Table.Cell>
                  <Table.Cell className="px-3 text-xs text-neutral-900 border-x border-neutral-200">
                    {price
                      ? formatPrice(price.amount, price.currency_code)
                      : "—"}
                  </Table.Cell>
                  <Table.Cell className="px-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span
                        className={getStockColor(variant.inventory_quantity)}
                      >
                        •
                      </span>
                      <span className="text-neutral-600">
                        {variant.inventory_quantity}
                      </span>
                    </span>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
