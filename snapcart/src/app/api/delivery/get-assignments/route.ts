import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session, error } = await requireRole("deliveryBoy");
    if (error) return error;
    await connectDb();
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: session!.user.id,
      status: "broadcasted",
    })
      .populate({ path: "order", select: "-deliveryOtp" })
      .sort({ createdAt: -1 });
    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}
