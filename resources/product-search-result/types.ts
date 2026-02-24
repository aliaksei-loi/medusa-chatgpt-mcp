import { z } from "zod";

export const productSchema = z.object({
  id: z.string().describe("Product ID"),
  title: z.string().describe("Product title"),
  handle: z.string().nullable().describe("URL-friendly slug"),
  thumbnail: z.string().nullable().describe("Thumbnail image URL"),
  description: z.string().nullable().describe("Product description"),
  price: z.number().nullable().describe("Cheapest variant price in cents"),
  currency_code: z.string().describe("Price currency code"),
  collection: z.string().nullable().describe("Collection name"),
  variants_count: z.number().describe("Number of variants"),
  inventory_quantity: z.number().describe("Total inventory quantity across all variants"),
});

export type Product = z.infer<typeof productSchema>;

export const propSchema = z.object({
  query: z.string().describe("The search query"),
  results: z.array(productSchema).describe("Product search results"),
});

export type ProductSearchResultProps = z.infer<typeof propSchema>;

export type AccordionItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};
