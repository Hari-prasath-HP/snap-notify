"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const role = session?.user?.role;

    if (role === "product_owner") {
      router.replace("/dashboard");
    } else if (role === "admin") {
      router.replace("/dashboard/admin/users");
    } else if (role === "user") {
      router.replace("/dashboard/user");
    } else {
      router.replace("/");
    }
  }, [session, status, router]);

  return <p>Redirecting...</p>;
}