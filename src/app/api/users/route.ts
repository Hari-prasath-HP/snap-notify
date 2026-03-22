import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Not logged in
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const ORG_ID = session.user.organizationId;

    // 🔒 Safety check
    if (!ORG_ID) {
      return new Response("Organization not found", { status: 400 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.user,
        organizationId: ORG_ID, // ✅ correct org
      },
    });

    return Response.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "User creation failed" }, { status: 500 });
  }
}