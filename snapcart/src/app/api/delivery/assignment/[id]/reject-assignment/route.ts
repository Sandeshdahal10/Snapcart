import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

/** Delivery boy declines a broadcasted assignment: he is removed from its broadcast list. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, error } = await requireRole("deliveryBoy");
    if (error) return error;
    await connectDb();
    const { id } = await params;
    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { _id: id, status: "broadcasted" },
      { $pull: { broadcastedTo: session!.user.id } },
      { new: true },
    );
    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not available" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Assignment rejected" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
