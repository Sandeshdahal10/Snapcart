import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
export async function POST(req: NextRequest){
  try {
     await connectDb();
    const { userId, items, paymentMethod, totalPrice, address } =
      await req.json();
    if (!items || !userId || !paymentMethod || !totalPrice || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalPrice,
      address,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url:`${process.env.NEXT_BASE_URL}/user/order-success`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/order-cancel`,
      line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'SnapCart Order',
        },
        unit_amount: totalPrice * 100,
      },
      quantity: 1,
    }],
    metadata:{orderId: newOrder._id.toString()}
    })
    return NextResponse.json({url:session.url}, {status:200})
  } catch (error) {
    return NextResponse.json(
      { message: "Order payment error", error },
      { status: 500 },
    );
  }
}