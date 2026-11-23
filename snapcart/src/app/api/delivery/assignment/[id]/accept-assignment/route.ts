import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, error } = await requireRole("deliveryBoy");
    if (error) return error;
    await connectDb();
    const { id } = await params;
    const deliveryBoyId = session!.user.id;

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    });
    if (alreadyAssigned) {
      return NextResponse.json(
        { message: "You already have an active assignment" },
        { status: 400 },
      );
    }

    // Atomic: only one delivery boy can win the assignment, even if two press Accept at once
    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { _id: id, status: "broadcasted", broadcastedTo: deliveryBoyId },
      { assignedTo: deliveryBoyId, status: "assigned", acceptedAt: new Date() },
      { new: true },
    );
    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not available" },
        { status: 400 },
      );
    }

    const order = await Order.findById(assignment.order);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }
    // 4-digit code the customer gives the delivery boy to confirm delivery
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
    order.assignedDeliveryBoy = deliveryBoyId;
    order.deliveryOtp = deliveryOtp;
    await order.save();

    // This delivery boy is busy now: remove him from his other pending broadcasts
    await DeliveryAssignment.updateMany(
      {
        _id: { $ne: assignment._id },
        broadcastedTo: deliveryBoyId,
        status: "broadcasted",
      },
      { $pull: { broadcastedTo: deliveryBoyId } },
    );

    // Tell the other delivery boys this one is taken
    await emitEventHandler("assignment-taken", { assignmentId: assignment._id });

    // Tell the customer (only them) who is coming, and their delivery code
    const [customer, deliveryBoy] = await Promise.all([
      User.findById(order.user).select("socketId"),
      User.findById(deliveryBoyId).select("name mobile location"),
    ]);
    if (customer?.socketId) {
      await emitEventHandler(
        "delivery-assigned",
        {
          orderId: order._id,
          assignedDeliveryBoy: deliveryBoy,
          deliveryOtp,
        },
        customer.socketId,
      );
    }

    return NextResponse.json(
      { message: "Assignment accepted successfully", assignment },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
