import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import webpush from "@/lib/webpush"; // 🔥 ADD THIS

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const organizationId = session.user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "User not linked to any organization" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { imageQuota: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    // ✅ tagged users
    const raw = formData.get("targetUserIds");
    const taggedUserIds: string[] = raw ? JSON.parse(raw as string) : [];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Max 5 images allowed" },
        { status: 400 }
      );
    }

    if (user.imageQuota <= 0) {
      return NextResponse.json(
        { error: "No more slots available" },
        { status: 400 }
      );
    }

    if (files.length > user.imageQuota) {
      return NextResponse.json(
        { error: `Only ${user.imageQuota} slots available` },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // 🔥 store receivers outside transaction for push later
    let receivers: string[] = [];
    let firstImageId: string | null = null;

    await prisma.$transaction(async (tx) => {
      const imageIds: string[] = [];

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `uploads/${uuid()}-${file.name}`;

        // Upload to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
          })
        );

        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        uploadedUrls.push(url);

        // ✅ Save image
        const image = await tx.image.create({
          data: {
            url,
            uploadedBy: userId,
            organizationId,
            tags: taggedUserIds,
          },
        });

        imageIds.push(image.id);
      }

      firstImageId = imageIds[0];

      // 🔥 Reduce quota
      await tx.user.update({
        where: { id: userId },
        data: {
          imageQuota: {
            decrement: files.length,
          },
        },
      });

      // 🔔 DB Notification
      if (taggedUserIds.length > 0) {
        receivers = [...new Set(taggedUserIds)];

        await tx.notification.create({
          data: {
            organizationId,
            senderId: userId,
            receiverIds: receivers,
            message: `${user.name || "Someone"} tagged you in ${files.length} image(s)`,
            imageId: firstImageId!,
          },
        });
      }
    });

    // 🔥 SEND PUSH NOTIFICATIONS (outside transaction)
    if (receivers.length > 0) {
      for (const receiverId of receivers) {
        const subscriptions = await prisma.pushSubscription.findMany({
          where: { userId: receiverId },
        });

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              JSON.stringify({
                title: "Tagged in Image 📸",
                body: "You were tagged!",
                url: "dashboard/user", 
              })
            );
          } catch (err: any) {
            console.error("Push failed:", err);

            // ✅ HANDLE EXPIRED SUBSCRIPTION
            if (err.statusCode === 410 || err.statusCode === 404) {
              await prisma.notification.delete({
                where: { id: sub.id },
              });

              console.log("Deleted expired subscription");
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}