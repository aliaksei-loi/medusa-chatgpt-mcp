import React, { useState } from "react";
import { Text } from "@medusajs/ui";
import { PlusMini, MinusMini } from "@medusajs/icons";
import { Animate } from "@openai/apps-sdk-ui/components/Transition";
import type { ProductDetail } from "../types";

interface ProductTabsProps {
  product: ProductDetail;
}

interface TabItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const TabItem: React.FC<TabItemProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
      >
        <Text className="text-neutral-950 font-medium">{title}</Text>
        <span className="text-neutral-400">
          {isOpen ? <MinusMini /> : <PlusMini />}
        </span>
      </button>
      <Animate enter={{ y: 0, delay: 150, duration: 450 }} exit={{ y: -8 }}>
        {isOpen && (
          <div key="content" className="pb-4 px-4">
            {children}
          </div>
        )}
      </Animate>
    </div>
  );
};

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [openTab, setOpenTab] = useState<string | null>(null);

  const toggleTab = (tab: string) => {
    setOpenTab(openTab === tab ? null : tab);
  };

  const hasDescription = !!product.description;
  const hasSpecs =
    product.variants.length > 0 ||
    product.options.some((opt) => opt.title !== "Default option");

  if (!hasDescription && !hasSpecs) return null;

  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
      {hasDescription && (
        <TabItem
          title="Description"
          isOpen={openTab === "description"}
          onToggle={() => toggleTab("description")}
        >
          <Text className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </Text>
        </TabItem>
      )}

      {hasSpecs && (
        <TabItem
          title="Specifications"
          isOpen={openTab === "specs"}
          onToggle={() => toggleTab("specs")}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {product.options
                  .filter((opt) => opt.title !== "Default option")
                  .map((opt) => (
                    <tr
                      key={opt.title}
                      className="border-b border-neutral-100 last:border-b-0"
                    >
                      <td className="py-2 pr-4 text-neutral-500 font-medium whitespace-nowrap">
                        {opt.title}
                      </td>
                      <td className="py-2 text-neutral-900">
                        {opt.values.join(", ")}
                      </td>
                    </tr>
                  ))}
                <tr className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-2 pr-4 text-neutral-500 font-medium whitespace-nowrap">
                    Variants
                  </td>
                  <td className="py-2 text-neutral-900">
                    {product.variants.length}
                  </td>
                </tr>
                {product.collection && (
                  <tr className="border-b border-neutral-100 last:border-b-0">
                    <td className="py-2 pr-4 text-neutral-500 font-medium whitespace-nowrap">
                      Collection
                    </td>
                    <td className="py-2 text-neutral-900">
                      {product.collection}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabItem>
      )}
    </div>
  );
};
