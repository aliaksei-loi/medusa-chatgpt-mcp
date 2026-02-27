export function getStockColor(quantity: number): string {
  if (quantity > 50) return "text-green-500";
  if (quantity > 0) return "text-orange-500";
  return "text-red-500";
}
