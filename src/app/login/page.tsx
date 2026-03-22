"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Paper, Title, Stack } from "@mantine/core";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (res?.error) {
    alert("Invalid credentials");
    return;
  }

  // 🔥 Force reload to get updated session
  window.location.href = "/redirect";
};

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: "100px auto" }}>
      <Title order={2} mb="lg" ta="center">
        Login
      </Title>

      <Stack>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />

        <PasswordInput
          label="Password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />

        <Button fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Stack>
    </Paper>
  );
}