import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
// GET → Fetch organizations
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        admin: true,
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // 🔹 Normalize names
    const lowerName = name.toLowerCase().replace(/\s+/g, "");
    const capitalizedName =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    // 🔹 Admin credentials
    const adminName = `${capitalizedName}Admin`;
    const adminEmail = `${lowerName}admin@gmail.com`;
    const rawPassword = `${capitalizedName}Admin@123`;

    // 🔍 Check org exists
    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: {
          equals: capitalizedName,
          mode: "insensitive",
        },
      },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization already exists" },
        { status: 400 }
      );
    }

    // 🔍 Check admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 🔥 TRANSACTION START
    const result = await prisma.$transaction(async (tx) => {
      // ✅ Step 1: Create admin (without org)
      const admin = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: Role.admin,
        },
      });

      // ✅ Step 2: Create organization + connect admin
      const organization = await tx.organization.create({
        data: {
          name: capitalizedName,
          address,
          phone,
          admin: {
            connect: { id: admin.id },
          },
        },
        include: {
          admin: true,
        },
      });

      // ✅ Step 3: Update admin with organizationId
      await tx.user.update({
        where: { id: admin.id },
        data: {
          organizationId: organization.id,
        },
      });

      return { organization, admin };
    });
    // 🔥 TRANSACTION END

    return NextResponse.json({
      organization: result.organization,
      admin: {
        email: adminEmail,
        password: rawPassword, // show once
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}