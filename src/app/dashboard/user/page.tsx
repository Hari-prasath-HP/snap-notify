import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  // 🔒 Redirect if not logged in
  if (!session) {
    redirect("/login");
  }

  // 🔍 Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      images: true,
    },
  });

  // ⚠️ Safety check (rare but important)
  if (!user) {
    redirect("/login");
  }

  return <DashboardClient user={user} />;
}