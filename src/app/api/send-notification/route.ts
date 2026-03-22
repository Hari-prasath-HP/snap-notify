import { NextResponse } from "next/server";
import webpush from "@/lib/webpush";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, title, body } = await req.json();

  console.log("📩 Incoming push request:", { userId, title });

  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId },
  });

  if (!subscription) {
    console.log("❌ No subscription found for user:", userId);
    return NextResponse.json({ message: "No subscription" });
  }

  console.log("✅ Found subscription:", subscription.endpoint);

  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    );

    console.log("🚀 Push sent successfully:", result);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Push error:", {
      message: err?.message,
      statusCode: err?.statusCode,
      body: err?.body,
    });

    return NextResponse.json({ error: "Failed" });
  }
}