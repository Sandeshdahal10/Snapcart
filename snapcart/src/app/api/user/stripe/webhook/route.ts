import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Webhook signature verification failed.", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await connectDb();
      const order = await Order.findByIdAndUpdate(
        session.metadata?.orderId,
        { isPaid: true },
        { new: true },
      );
      // Admin sees online orders only once they are paid
      if (order) await emitEventHandler("new-order", order);
    }

    if (event.type === "checkout.session.expired") {
      // Customer never paid: remove the unpaid order
      const session = event.data.object as Stripe.Checkout.Session;
      await connectDb();
      await Order.deleteOne({
        _id: session.metadata?.orderId,
        paymentMethod: "Online",
        isPaid: false,
      });
    }
  } catch (error) {
    console.error("Webhook handling error", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
