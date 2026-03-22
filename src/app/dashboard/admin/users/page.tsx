import { prisma } from "@/lib/prisma";
import UsersTable from "./UsersTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const users = await prisma.user.findMany({
    where: {
      organizationId: session.user.organizationId, // ✅ dynamic
      role: "user",
    },
  });

  return <UsersTable users={users} />;
}