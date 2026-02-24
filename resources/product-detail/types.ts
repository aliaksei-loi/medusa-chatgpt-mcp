import { z } from "zod";

export const variantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable(),
  inventory_quantity: z.number(),
  prices: z.array(
    z.object({
      amount: z.number(),
      currency_code: z.string(),
    })
  ),
});

export const productDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  handle: z.string().nullable(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  images: z.array(z.string()),
  options: z.array(
    z.object({
      title: z.string(),
      values: z.array(z.string()),
    })
  ),
  variants: z.array(variantSchema),
  collection: z.string().nullable(),
  tags: z.array(z.string()),
});

export type ProductDetail = z.infer<typeof productDetailSchema>;
export type Variant = z.infer<typeof variantSchema>;
