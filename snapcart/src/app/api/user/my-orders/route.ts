import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    // name + mobile is all the customer needs to see about the delivery boy
    // Hide online orders whose payment was never completed (same rule as the admin list)
    const orders = await Order.find({
      user: session.user.id,
      $or: [{ paymentMethod: "COD" }, { isPaid: true }],
    })
      .populate("assignedDeliveryBoy", "name mobile")
      .sort({ createdAt: -1 });
    if (!orders) {
      return new NextResponse(JSON.stringify({ message: "No orders found" }), {
        status: 400,
      });
    }
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 },
    );
  }
}
