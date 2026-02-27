import { MCPServer, error, object, text, widget } from "mcp-use/server";
import { z } from "zod";

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY =
  process.env.MEDUSA_PUBLISHABLE_KEY || "publishableApiKey";
const ADMIN_KEY = process.env.MEDUSA_ADMIN_KEY || "";
const DEMO_EMAIL = process.env.DEMO_ORDER_EMAIL ?? "demo@example.com";

/* ── Medusa API response types ─────────────────────────────────── */

interface MedusaPrice {
  amount: number;
  currency_code: string;
}

interface MedusaCalculatedPrice {
  calculated_amount?: number | null;
  original_amount?: number | null;
  currency_code?: string | null;
}

interface MedusaVariant {
  id: string;
  title: string;
  sku?: string | null;
  inventory_quantity?: number;
  calculated_price?: MedusaCalculatedPrice | number | null;
  prices?: MedusaPrice[];
}

interface MedusaProduct {
  id: string;
  title: string;
  handle?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  images?: Array<{ url: string }>;
  collection?: { title: string } | null;
  variants?: MedusaVariant[];
  options?: Array<{ title: string; values: Array<{ value: string }> }>;
  tags?: Array<{ value: string }>;
}

/** Direct fetch helper for the Medusa v2 Admin API */
async function medusaAdminFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path, MEDUSA_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${ADMIN_KEY}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa Admin API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function medusaAdminPost<T>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const url = new URL(path, MEDUSA_URL);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Basic ${ADMIN_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Medusa Admin API ${res.status}: ${errBody}`);
  }
  return res.json() as Promise<T>;
}

/** Direct fetch helper for the Medusa v2 Store API */
async function medusaFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path, MEDUSA_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

/** Direct POST helper for the Medusa v2 Store API */
async function medusaPost<T>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const url = new URL(path, MEDUSA_URL);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Medusa API ${res.status}: ${errBody}`);
  }
  return res.json() as Promise<T>;
}

/** Cached default region for pricing context */
let defaultRegionId: string | undefined;
let defaultCurrencyCode = "usd";

async function ensureRegion() {
  if (defaultRegionId) return;
  try {
    const data = await medusaFetch<{ regions: Array<{ id: string; currency_code?: string }> }>("/store/regions");
    if (data.regions.length > 0) {
      defaultRegionId = data.regions[0].id;
      defaultCurrencyCode = data.regions[0].currency_code ?? "usd";
    }
  } catch (err) {
    console.warn("Failed to fetch regions:", err);
  }
}

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
function getLowestPrice(product: MedusaProduct): {
  amount: number | null;
  currency_code: string;
} {
  let lowest: number | null = null;
  let currency = defaultCurrencyCode;

  for (const variant of product.variants ?? []) {
    // Medusa v2: calculated_price is an object with calculated_amount
    const cp = variant.calculated_price;
    if (cp != null) {
      const amount =
        typeof cp === "number"
          ? cp
          : (cp.calculated_amount ?? cp.original_amount ?? null);
      if (amount != null) {
        if (lowest === null || amount < lowest) {
          lowest = amount;
          currency =
            (typeof cp === "object" ? cp.currency_code : null) ??
            defaultCurrencyCode;
        }
        continue;
      }
    }
    // Fallback to prices array (v1 style)
    for (const price of variant.prices ?? []) {
      if (lowest === null || price.amount < lowest) {
        lowest = price.amount;
        currency = price.currency_code ?? defaultCurrencyCode;
      }
    }
  }

  return { amount: lowest, currency_code: currency };
}

/** Map a Medusa product to the simplified shape used by the widget */
function toWidgetProduct(product: MedusaProduct) {
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
      (acc: number, v: MedusaVariant) => acc + (v.inventory_quantity ?? 0),
      0,
    ),
    default_variant_id: product.variants?.[0]?.id ?? null,
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
      await ensureRegion();
      const { products } = await medusaFetch<{ products: MedusaProduct[] }>(
        "/store/products",
        {
          q: query || undefined,
          limit: limit ?? 20,
          region_id: defaultRegionId,
          fields: "*variants.calculated_price,+variants.inventory_quantity",
        },
      );

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
    widget: {
      name: "product-detail",
      invoking: "Loading product details...",
      invoked: "Product loaded",
    },
  },
  async ({ product_id }) => {
    try {
      await ensureRegion();
      const { products } = await medusaFetch<{ products: MedusaProduct[] }>(
        "/store/products",
        {
          id: product_id,
          region_id: defaultRegionId,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
        },
      );
      const product = products[0];
      if (!product) {
        return error(`Product ${product_id} not found`);
      }

      const productData = {
        id: product.id,
        title: product.title,
        handle: product.handle ?? null,
        description: product.description ?? null,
        thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
        images: (product.images ?? []).map((img) => img.url),
        options: (product.options ?? []).map((opt) => ({
          title: opt.title,
          values: (opt.values ?? []).map((v) => v.value),
        })),
        variants: (product.variants ?? []).map((v) => {
          // Build prices array: prefer calculated_price (v2), fall back to prices array (v1)
          const cp = v.calculated_price;
          let prices: Array<{ amount: number; currency_code: string }> = [];
          if (cp != null) {
            const amount =
              typeof cp === "number"
                ? cp
                : (cp.calculated_amount ?? cp.original_amount ?? null);
            if (amount != null) {
              prices = [
                {
                  amount,
                  currency_code:
                    (typeof cp === "object" ? cp.currency_code : null) ??
                    defaultCurrencyCode,
                },
              ];
            }
          }
          if (prices.length === 0) {
            prices = (v.prices ?? []).map((p) => ({
              amount: p.amount,
              currency_code: p.currency_code,
            }));
          }
          return {
            id: v.id,
            title: v.title,
            sku: v.sku ?? null,
            inventory_quantity: v.inventory_quantity ?? 0,
            prices,
          };
        }),
        collection: product.collection?.title ?? null,
        tags: (product.tags ?? []).map((t) => t.value),
      };

      return widget({
        props: productData,
        output: text(
          `Product: ${productData.title}${productData.collection ? ` (${productData.collection})` : ""} — ${productData.variants.length} variant(s)`,
        ),
      });
    } catch (err) {
      console.error("Failed to retrieve product:", err);
      return error(
        `Failed to retrieve product ${product_id}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  },
);

/**
 * TOOL: Add to cart
 * Called by product widgets when the user clicks "Add to Cart".
 * Returns a text response so the AI knows what was added.
 */
server.tool(
  {
    name: "add-to-cart",
    description:
      "Add a product to the shopping cart. Called when the user clicks 'Add to Cart' on a product.",
    schema: z.object({
      productId: z.string().describe("Product ID"),
      variantId: z.string().nullable().describe("Variant ID"),
      title: z.string().describe("Product title"),
      variantTitle: z
        .string()
        .nullable()
        .describe("Variant title (e.g. size/color)"),
      quantity: z.number().describe("Quantity to add"),
      price: z.number().nullable().describe("Price per unit in cents"),
      currencyCode: z.string().describe("Currency code (e.g. usd)"),
    }),
  },
  async ({ title, variantTitle, quantity, price, currencyCode }) => {
    const priceStr =
      price != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode.toUpperCase(),
          }).format(price / 100)
        : "";

    const variant = variantTitle ? ` (${variantTitle})` : "";
    return text(
      `Added ${quantity}x "${title}"${variant} to the cart.${priceStr ? ` Price: ${priceStr}` : ""}`,
    );
  },
);

/**
 * TOOL: View cart
 * Displays the shopping cart with items, totals and checkout options.
 */
server.tool(
  {
    name: "view-cart",
    description:
      "Display the shopping cart with all items, quantities, totals and options to continue shopping or modify the cart",
    schema: z.object({
      items: z
        .array(
          z.object({
            id: z.string().describe("Cart line item ID"),
            productId: z.string().describe("Product ID"),
            variantId: z.string().nullable().describe("Variant ID"),
            title: z.string().describe("Product title"),
            variantTitle: z.string().nullable().describe("Variant title"),
            thumbnail: z.string().nullable().describe("Thumbnail image URL"),
            quantity: z.number().describe("Quantity"),
            price: z.number().nullable().describe("Price in cents"),
            currencyCode: z.string().describe("Currency code"),
          }),
        )
        .describe("Cart items to display"),
      currencyCode: z
        .string()
        .optional()
        .describe(
          "Cart currency code (defaults to first item's currency or usd)",
        ),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "cart",
      invoking: "Loading cart...",
      invoked: "Cart loaded",
    },
  },
  async ({ items, currencyCode }) => {
    const currency = currencyCode ?? items[0]?.currencyCode ?? "usd";
    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

    const fmt = (amount: number | null, code: string) =>
      amount != null
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: code.toUpperCase(),
          }).format(amount / 100)
        : "N/A";

    let outputText: string;
    if (totalQuantity === 0) {
      outputText = "Your shopping cart is empty";
    } else {
      const lines = items.map(
        (i) =>
          `- ${i.quantity}x "${i.title}"${i.variantTitle ? ` (${i.variantTitle})` : ""} — ${fmt(i.price != null ? i.price * i.quantity : null, i.currencyCode)}`,
      );
      const total = items.reduce(
        (acc, i) => acc + (i.price ?? 0) * i.quantity,
        0,
      );
      outputText = `Shopping cart (${totalQuantity} item${totalQuantity !== 1 ? "s" : ""}):\n${lines.join("\n")}\nTotal: ${fmt(total, currency)}`;
    }

    return widget({
      props: { items, currencyCode: currency },
      output: text(outputText),
    });
  },
);

/**
 * TOOL: Place order
 * Creates a Medusa cart, adds line items, and completes it to create a real order.
 */
server.tool(
  {
    name: "place-order",
    description:
      "Place an order by creating a Medusa cart, adding line items, and completing it. Called when the user clicks 'Place Order' in the cart.",
    schema: z.object({
      items: z
        .array(
          z.object({
            productId: z.string().nullable().describe("Medusa product ID"),
            quantity: z.number().describe("Quantity"),
            title: z.string().describe("Product title (for display)"),
          }),
        )
        .describe("Cart items to order"),
    }),
  },
  async ({ items }) => {
    try {
      // 1. Ensure region
      await ensureRegion();
      if (!defaultRegionId) {
        return error(
          "Could not determine store region. Check Medusa configuration.",
        );
      }

      // 2. Create cart
      const { cart } = await medusaPost<{ cart: { id: string } }>(
        "/store/carts",
        { region_id: defaultRegionId, email: DEMO_EMAIL },
      );

      // 3. Add all line items — fetch each product to get real variant IDs
      for (const cartItem of items) {
        if (!cartItem.productId) {
          console.warn(`Skipping item "${cartItem.title}" — no productId`);
          continue;
        }
        const { products } = await medusaFetch<{ products: MedusaProduct[] }>(
          "/store/products",
          { id: cartItem.productId, region_id: defaultRegionId },
        );
        const product = products?.[0];
        if (!product) {
          console.warn(`Product ${cartItem.productId} not found, skipping`);
          continue;
        }
        const variant = product.variants?.[0];
        if (!variant) {
          console.warn(`Product "${product.title}" has no variants, skipping`);
          continue;
        }
        await medusaPost(`/store/carts/${cart.id}/line-items`, {
          variant_id: variant.id,
          quantity: cartItem.quantity,
        });
      }

      // 4. Initialize payment collection
      const { payment_collection } = await medusaPost<{
        payment_collection: { id: string };
      }>(`/store/payment-collections`, {
        cart_id: cart.id,
      });

      // 5. Create payment session with system default provider
      await medusaPost(
        `/store/payment-collections/${payment_collection.id}/payment-sessions`,
        { provider_id: "pp_system_default" },
      );

      // 6. Complete cart → create order
      const result = await medusaPost<{
        type: string;
        order?: { id: string; display_id?: number };
        error?: string;
      }>(`/store/carts/${cart.id}/complete`, {});

      if (result.type === "order" && result.order) {
        const orderId = result.order.display_id
          ? `#${result.order.display_id}`
          : result.order.id;
        return text(
          `Order placed successfully! Order ${orderId}. A confirmation will be sent to ${DEMO_EMAIL}.`,
        );
      }

      return error(
        `Cart was created but could not be completed. ${result.error ?? "The store may require payment setup."}`,
      );
    } catch (err) {
      console.error("Failed to place order:", err);
      return error(
        `Failed to place order: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  },
);

/**
 * TOOL: Clear all orders (demo utility)
 * Cancels all non-canceled orders via the Admin API.
 */
server.tool(
  {
    name: "clear-orders",
    description:
      "Cancel all orders in the store. Demo utility for resetting order state.",
  },
  async () => {
    try {
      if (!ADMIN_KEY) {
        return error("MEDUSA_ADMIN_KEY is not configured.");
      }

      // Fetch all orders
      const { orders } = await medusaAdminFetch<{
        orders: { id: string; display_id?: number; status: string }[];
      }>("/admin/orders", { limit: 100 });

      if (orders.length === 0) {
        return text("No orders found.");
      }

      // Cancel and archive all orders
      const toProcess = orders.filter((o) => o.status !== "archived");
      if (toProcess.length === 0) {
        return text(`All ${orders.length} order(s) are already archived.`);
      }

      let archived = 0;
      for (const order of toProcess) {
        try {
          if (order.status !== "canceled") {
            await medusaAdminPost(`/admin/orders/${order.id}/cancel`, {});
          }
          await medusaAdminPost(`/admin/orders/${order.id}/archive`, {});
          archived++;
        } catch (err) {
          console.warn(`Failed to archive order ${order.id}:`, err);
        }
      }

      return text(`Archived ${archived} of ${toProcess.length} order(s).`);
    } catch (err) {
      console.error("Failed to clear orders:", err);
      return error(
        `Failed to clear orders: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  },
);

server.listen().then(() => {
  console.log(`Server running`);
});
