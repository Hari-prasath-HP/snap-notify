import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 🔴 DELETE USER
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 🔥 FIX

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return new Response("Forbidden", { status: 403 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return Response.json({ success: true });
}

// 🟢 UPDATE USER
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 🔥 FIX

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { name, email } = body;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return new Response("Forbidden", { status: 403 });
  }

  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing && existing.id !== id) {
      return new Response("Email already in use", { status: 400 });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
    },
  });

  return Response.json(updatedUser);
}

// 🔵 GET USER
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // 🔥 FIX

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json(user);
}