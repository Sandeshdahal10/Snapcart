import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

/** Returns one order of the logged-in customer, with the delivery boy's name, mobile and location. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { session, error } = await requireRole("user");
    if (error) return error;
    await connectDb();
    const { orderId } = await params;
    const order = await Order.findById(orderId).populate(
      "assignedDeliveryBoy",
      "name mobile location",
    );
    if (!order || String(order.user) !== session!.user.id) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
