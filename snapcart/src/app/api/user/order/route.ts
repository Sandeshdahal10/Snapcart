import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, items, paymentMethod, totalPrice, address } =
      await req.json();
    if (!items || !userId || !paymentMethod || !totalPrice || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalPrice,
      address,
    });
    await emitEventHandler("new-order",newOrder)
    return NextResponse.json(
      { message: "Order placed successfully", order: newOrder },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
