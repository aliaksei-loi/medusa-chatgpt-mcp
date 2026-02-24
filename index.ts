import { MCPServer, error, object, text, widget } from "mcp-use/server";
import { z } from "zod";
import Medusa from "@medusajs/medusa-js";

const medusa = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
  publishableApiKey: process.env.MEDUSA_PUBLISHABLE_KEY || "testkey",
});

const server = new MCPServer({
  name: "medusa-chatgpt-mcp",
  title: "Medusa Store",
  version: "1.0.0",
  description: "MCP server for browsing Medusa ecommerce products",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [
    {
      src: "icon.svg",
      mimeType: "image/svg+xml",
      sizes: ["512x512"],
    },
  ],
});

/** Helper: extract cheapest price from a product's variants */
function getLowestPrice(product: any): {
  amount: number | null;
  currency_code: string;
} {
  let lowest: number | null = null;
  let currency = "usd";

  for (const variant of product.variants ?? []) {
    // Use calculated_price first (context-aware), fall back to prices array
    if (variant.calculated_price != null) {
      if (lowest === null || variant.calculated_price < lowest) {
        lowest = variant.calculated_price;
      }
      continue;
    }
    for (const price of variant.prices ?? []) {
      if (lowest === null || price.amount < lowest) {
        lowest = price.amount;
        currency = price.currency_code ?? "usd";
      }
    }
  }

  return { amount: lowest, currency_code: currency };
}

/** Map a Medusa product to the simplified shape used by the widget */
function toWidgetProduct(product: any) {
  const { amount, currency_code } = getLowestPrice(product);
  return {
    id: product.id,
    title: product.title,
    handle: product.handle ?? null,
    thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
    description: product.description ?? null,
    price: amount,
    currency_code,
    collection: product.collection?.title ?? null,
    variants_count: product.variants?.length ?? 0,
    inventory_quantity: (product.variants ?? []).reduce(
      (acc: number, v: any) => acc + ((v.inventory_quantity as number) ?? 0),
      0
    ),
  };
}

/**
 * TOOL: Search products
 * Calls the Medusa Store API to list/search products and displays results in a widget.
 */
server.tool(
  {
    name: "search-products",
    description:
      "Search for products in the Medusa store and display results in a visual widget",
    schema: z.object({
      query: z.string().optional().describe("Search query to filter products"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of products to return (default 20)"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "product-search-result",
      invoking: "Searching products...",
      invoked: "Products loaded",
    },
  },
  async ({ query, limit }) => {
    try {
      const { products } = await medusa.products.list({
        q: query || undefined,
        limit: limit ?? 20,
      });

      const results = products.map(toWidgetProduct);

      return widget({
        props: { query: query ?? "", results },
        output: text(
          `Found ${results.length} product${results.length !== 1 ? "s" : ""} matching "${query ?? "all"}"`,
        ),
      });
    } catch (err) {
      console.error("Failed to search products:", err);
      return error(
        `Failed to fetch products from Medusa: ${err instanceof Error ? err.message : "Unknown error"}. Make sure MEDUSA_BACKEND_URL is set correctly.`,
      );
    }
  },
);

/**
 * TOOL: Get product details
 * Retrieves a single product by ID from the Medusa Store API.
 */
server.tool(
  {
    name: "get-product-details",
    description: "Get detailed information about a specific product by its ID",
    schema: z.object({
      product_id: z
        .string()
        .describe("The Medusa product ID (e.g. prod_01...)"),
    }),
    annotations: { readOnlyHint: true },
    outputSchema: z.object({
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
        }),
      ),
      variants: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          sku: z.string().nullable(),
          inventory_quantity: z.number(),
          prices: z.array(
            z.object({
              amount: z.number(),
              currency_code: z.string(),
            }),
          ),
        }),
      ),
      collection: z.string().nullable(),
      tags: z.array(z.string()),
    }),
  },
  async ({ product_id }) => {
    try {
      const { product } = await medusa.products.retrieve(product_id);

      return object({
        id: product.id!,
        title: product.title!,
        handle: product.handle ?? null,
        description: product.description ?? null,
        thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
        images: (product.images ?? []).map((img: any) => img.url as string),
        options: (product.options ?? []).map((opt: any) => ({
          title: opt.title as string,
          values: (opt.values ?? []).map((v: any) => v.value as string),
        })),
        variants: (product.variants ?? []).map((v: any) => ({
          id: v.id as string,
          title: v.title as string,
          sku: (v.sku as string) ?? null,
          inventory_quantity: (v.inventory_quantity as number) ?? 0,
          prices: (v.prices ?? []).map((p: any) => ({
            amount: p.amount as number,
            currency_code: p.currency_code as string,
          })),
        })),
        collection: (product.collection?.title as string) ?? null,
        tags: (product.tags ?? []).map((t: any) => t.value as string),
      });
    } catch (err) {
      console.error("Failed to retrieve product:", err);
      return error(
        `Failed to retrieve product ${product_id}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  },
);

server.listen().then(() => {
  console.log(`Server running`);
});
