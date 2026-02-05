import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    const orders = await Order.find({ user: session?.user?.id }).populate(
      "user",
    );
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
