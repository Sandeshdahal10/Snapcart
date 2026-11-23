import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session, error } = await requireRole("deliveryBoy");
    if (error) return error;
    await connectDb();
    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: session!.user.id,
      status: "assigned",
    })
      // address is embedded in the order, so only the order itself needs populating.
      // The delivery code is left out: the delivery boy must get it from the customer.
      .populate({ path: "order", select: "-deliveryOtp" })
      .lean();
    if (!activeAssignment) {
      return NextResponse.json({ active: false }, { status: 200 });
    }
    return NextResponse.json(
      { active: true, assignment: activeAssignment },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch current order" },
      { status: 500 },
    );
  }
}
