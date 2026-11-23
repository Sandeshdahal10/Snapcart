import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
  try {
    const { error } = await requireRole("admin");
    if (error) return error;
    await connectDb();
    // Hide online orders whose payment was never completed
    const orders=await Order.find({ $or: [{ paymentMethod: "COD" }, { isPaid: true }] })
      .populate("user assignedDeliveryBoy", "-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({orders},{status:200})
  } catch (error) {
    return NextResponse.json({error:"Internal Server Error"},{status:500})
  }
}
