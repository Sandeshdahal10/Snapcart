import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { priceOrder, validateAddress } from "@/lib/priceOrder";
import { requireRole } from "@/lib/requireRole";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

/** Cash on Delivery order. */
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireRole("user");
    if (error) return error;
    await connectDb();
    const { items, address } = await req.json();
    if (!items || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const addressError = validateAddress(address);
    if (addressError) {
      return NextResponse.json({ message: addressError }, { status: 400 });
    }

    let priced;
    try {
      priced = await priceOrder(items);
    } catch (e: any) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }

    const newOrder = await Order.create({
      user: session!.user.id,
      items: priced.items,
      paymentMethod: "COD",
      totalPrice: priced.totalPrice,
      address,
    });
    await emitEventHandler("new-order", newOrder);
    return NextResponse.json(
      { message: "Order placed successfully", order: newOrder },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
