"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
} from "@mantine/core";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const userId = params?.id as string;
  console.log("USER ID:", userId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch user data
  useEffect(() => {
    if (!userId) return; // 🔥 FIX

    const fetchUser = async () => {
      const res = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });

      const data = await res.json();

      console.log("DATA:", data); // 🔍 debug

      setName(data?.name || "");
      setEmail(data?.email || "");
    };

    fetchUser();
  }, [userId]);

  // 🔥 Update user
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard/admin/users");
      router.refresh();
    } else {
      alert("Update failed ❌");
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="md" p="xl" radius="lg" withBorder>
        <Title order={2} mb="md">
          Edit User
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} fullWidth>
              Update User
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}