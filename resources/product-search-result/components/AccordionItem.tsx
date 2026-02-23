import { Animate } from "@openai/apps-sdk-ui/components/Transition";
import { Text } from "@medusajs/ui";
import { PlusMini, MinusMini } from "@medusajs/icons";
import React from "react";
import type { AccordionItemProps } from "../types";

export const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border-b border-subtle last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-soft-hover transition-colors"
      >
        <Text weight="plus" className="text-default">{question}</Text>
        <span className="text-tertiary">
          {isOpen ? <MinusMini /> : <PlusMini />}
        </span>
      </button>
      <Animate enter={{ y: 0, delay: 150, duration: 450 }} exit={{ y: -8 }}>
        {isOpen && (
          <div key="content" className="pb-4 px-4">
            <Text size="small" className="text-secondary">{answer}</Text>
          </div>
        )}
      </Animate>
    </div>
  );
};
