import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { name, address, phone } = body;

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        name,
        address,
        phone,
      },
    });

    return Response.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is Promise
) {
  const { id } = await params; // ✅ unwrap here

  await prisma.organization.delete({
    where: {
      id: id,
    },
  });

  return Response.json({ success: true });
}