import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PRICE_PER_SLOT = 20;

export async function POST(req: Request) {
  try {
    const { slots } = await req.json();

    const amount = slots * PRICE_PER_SLOT * 100; // paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
    });
  } catch (err) {
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}