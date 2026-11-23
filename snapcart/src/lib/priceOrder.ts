import Grocery from "@/models/grocery.model";

/**
 * Rebuilds the order items and total from the database prices,
 * so a customer cannot change the price in the browser before ordering.
 * Delivery fee rule matches redux/cartSlice.ts: free above $100, otherwise $40.
 */
export async function priceOrder(
  items: { grocery: string; quantity: number }[],
) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }
  const ids = items.map((i) => i.grocery);
  const groceries = await Grocery.find({ _id: { $in: ids } });
  const byId = new Map<string, any>(groceries.map((g: any) => [String(g._id), g]));

  const pricedItems = items.map((i) => {
    const g = byId.get(String(i.grocery));
    const quantity = Math.max(1, Math.floor(Number(i.quantity) || 1));
    if (!g) throw new Error("A product in your cart is no longer available");
    return {
      grocery: g._id,
      name: g.name,
      price: g.price,
      unit: g.unit,
      image: g.image,
      quantity,
    };
  });

  const subTotal = pricedItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );
  const deliveryFee = subTotal > 100 ? 0 : 40;
  const totalPrice = Math.round((subTotal + deliveryFee) * 100) / 100;
  return { items: pricedItems, totalPrice };
}

/**
 * Checks the delivery address sent from checkout.
 * Latitude/longitude are required: the admin's "Out for Delivery" step
 * searches for delivery boys near these coordinates.
 * Returns an error message, or null if the address is fine.
 */
export function validateAddress(address: any): string | null {
  if (!address || typeof address !== "object") return "Delivery address is required";
  for (const field of ["fullName", "mobile", "fullAddress"]) {
    if (typeof address[field] !== "string" || !address[field].trim()) {
      return `Address field "${field}" is required`;
    }
  }
  const lat = Number(address.latitude);
  const lng = Number(address.longitude);
  if (
    address.latitude == null || address.longitude == null ||
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    return "Pick a valid delivery location on the map";
  }
  return null;
}
