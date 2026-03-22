import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Upload logo API called");
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `logos/${organizationId}-${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const logoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        logoUrl: logoUrl,
      },
    });

    return NextResponse.json({
      message: "Logo uploaded successfully",
      logoUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}