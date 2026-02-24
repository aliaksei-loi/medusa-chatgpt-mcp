import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().describe("Cart line item ID"),
  productId: z.string().describe("Product ID"),
  variantId: z.string().nullable().describe("Variant ID"),
  title: z.string().describe("Product title"),
  variantTitle: z.string().nullable().describe("Variant title"),
  thumbnail: z.string().nullable().describe("Thumbnail image URL"),
  quantity: z.number().describe("Quantity"),
  price: z.number().nullable().describe("Price in cents"),
  currencyCode: z.string().describe("Currency code"),
});

export const cartWidgetSchema = z.object({
  items: z.array(cartItemSchema).describe("Cart items"),
  currencyCode: z.string().describe("Cart currency code"),
});

export type CartWidgetProps = z.infer<typeof cartWidgetSchema>;
export type CartWidgetItem = z.infer<typeof cartItemSchema>;
