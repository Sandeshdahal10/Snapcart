import connectDb from "@/lib/db";
import { priceOrder, validateAddress } from "@/lib/priceOrder";
import { requireRole } from "@/lib/requireRole";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Online payment: creates an unpaid order, then a Stripe Checkout session.
 * The Stripe webhook (/api/user/stripe/webhook) marks it paid, or deletes it if the session expires.
 */
export async function POST(req: NextRequest) {
  try {
    const { session: authSession, error } = await requireRole("user");
    if (error) return error;
    await connectDb();
    const { items, address } = await req.json();
    if (!items || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const addressError = validateAddress(address);
    if (addressError) {
      return NextResponse.json({ message: addressError }, { status: 400 });
    }

    let priced;
    try {
      priced = await priceOrder(items);
    } catch (e: any) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }

    const newOrder = await Order.create({
      user: authSession!.user.id,
      items: priced.items,
      paymentMethod: "Online",
      totalPrice: priced.totalPrice,
      address,
    });

    let session: Stripe.Checkout.Session;
    try {
      session = await createCheckoutSession(newOrder._id.toString(), priced.totalPrice);
    } catch (stripeError) {
      // Don't leave an unpaid order behind if Stripe could not start the payment
      await Order.deleteOne({ _id: newOrder._id });
      console.log("Stripe checkout error:", (stripeError as Error)?.message);
      return NextResponse.json(
        { message: "Could not start online payment. Please try again or use Cash on Delivery." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Order payment error" },
      { status: 500 },
    );
  }
}

function createCheckoutSession(orderId: string, totalPrice: number) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
    cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "SnapCart Order",
          },
          // Stripe wants a whole number of cents
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { orderId },
  });
}
