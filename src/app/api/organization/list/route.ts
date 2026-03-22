import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    include: {
      admin: true,
    },
  });

  return NextResponse.json(organizations);
}