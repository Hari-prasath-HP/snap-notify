import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      slots,
      amount,
    } = body;

    // 🔐 Step 0: Get logged-in user (secure)
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 🔍 Step 1: Fetch user + organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { success: false, message: "User organization not found" },
        { status: 400 }
      );
    }

    // 🔐 Step 2: Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 🔒 Step 3: Safe DB operation (prevents duplicates)

    try {
      // ✅ Create payment FIRST
      await prisma.payment.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          amount,
          slotsPurchased: slots,
          transactionId: razorpay_payment_id,
          status: "success",
        },
      });

      // ✅ Only update quota if payment creation succeeds
      await prisma.user.update({
        where: { id: userId },
        data: {
          imageQuota: {
            increment: slots,
          },
        },
      });

    } catch (error: any) {
      // 🔁 If duplicate transaction → already processed
      if (error.code === "P2002") {
        return NextResponse.json({
          success: true,
          message: "Already processed",
        });
      }

      throw error;
    }

    // ✅ Final response
    return NextResponse.json({
      success: true,
      message: "Payment verified & quota updated",
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}