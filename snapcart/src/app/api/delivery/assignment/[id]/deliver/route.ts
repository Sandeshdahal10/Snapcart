import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

/**
 * Delivery boy marks his active order as delivered.
 * Body: { otp: string } — the 4-digit code the customer sees in "My Orders".
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, error } = await requireRole("deliveryBoy");
    if (error) return error;
    await connectDb();
    const { id } = await params;
    const { otp } = await req.json();

    const assignment = await DeliveryAssignment.findOne({
      _id: id,
      assignedTo: session!.user.id,
      status: "assigned",
    });
    if (!assignment) {
      return NextResponse.json(
        { message: "Active assignment not found" },
        { status: 400 },
      );
    }
    const order = await Order.findById(assignment.order);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }
    if (!otp || String(otp).trim() !== order.deliveryOtp) {
      return NextResponse.json(
        { message: "Wrong delivery code. Ask the customer for the code shown in their order." },
        { status: 400 },
      );
    }

    order.status = "Delivered";
    order.deliveredAt = new Date();
    order.deliveryOtp = null;
    if (order.paymentMethod === "COD") {
      order.isPaid = true; // cash collected at the door
    }
    await order.save();

    assignment.status = "completed";
    await assignment.save();

    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
      isPaid: order.isPaid,
    });

    return NextResponse.json(
      { message: "Order delivered successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
