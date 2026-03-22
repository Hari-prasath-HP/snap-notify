import { prisma } from "@/lib/prisma";
import EditForm from "./EditForm";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return <EditForm organization={organization} />;
}