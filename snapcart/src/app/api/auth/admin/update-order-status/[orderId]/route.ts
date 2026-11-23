import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { requireRole } from "@/lib/requireRole";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;
    await connectDb();
    const { orderId } = await params;
    const { status } = await req.json();
    // "Delivered" is set by the delivery boy with the customer's code, not by the admin
    if (!["Pending", "Out for Delivery"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    const order = await Order.findById(orderId).populate("user", "-password");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }
    if (order.status === "Delivered") {
      return NextResponse.json(
        { message: "Order is already delivered" },
        { status: 400 },
      );
    }
    if (order.assignedDeliveryBoy && status === "Pending") {
      return NextResponse.json(
        { message: "A delivery boy has already accepted this order" },
        { status: 400 },
      );
    }
    order.status = status;
    let deliveryBoysPayload: any = [];
    if (status === "Out for Delivery" && !order.assignment) {
      const { latitude, longitude } = order.address;
      // $near needs the 2dsphere index on users.location. createIndexes is a no-op
      // when it exists, and rebuilds it if the database was reset while the app runs.
      await User.createIndexes();
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 50000, // 50 km
          },
        },
      });

      const nearById = nearByDeliveryBoys.map((b) => b._id);
      const busyId = await DeliveryAssignment.find({
        assignedTo: { $in: nearById },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");
      const busyIdSet = new Set(busyId.map((id) => String(id)));
      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );
      const candidates = availableDeliveryBoys.map((b) => b._id);
      if (candidates.length == 0) {
        await order.save();
        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });
        return NextResponse.json(
          { message: "No Delivery Boys available" },
          { status: 200 },
        );
      }
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });
      await deliveryAssignment.populate("order");
      for (const boyId of candidates) {
        const boy = await User.findById(boyId);
        if (boy?.socketId) {
          await emitEventHandler(
            "new-delivery-assignment",deliveryAssignment,boy.socketId
          );
        }
      }

      order.assignment = deliveryAssignment._id;
      deliveryBoysPayload = availableDeliveryBoys.map((b) => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }));
    }
    await order.save();
    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });
    return NextResponse.json(
      {
        assignment: order.assignment?._id,
        availableBoys: deliveryBoysPayload,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("update-order-status error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
