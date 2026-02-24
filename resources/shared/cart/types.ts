export interface CartItem {
  id: string; // unique cart line ID
  productId: string;
  variantId: string | null;
  title: string;
  variantTitle: string | null;
  thumbnail: string | null;
  quantity: number;
  price: number | null; // in cents
  currencyCode: string;
}

export interface CartState {
  items: CartItem[];
}
