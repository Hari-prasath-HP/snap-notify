"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Stack,
} from "@mantine/core";

export default function EditForm({ organization }: any) {
  const router = useRouter();

  const [name, setName] = useState(organization.name);
  const [address, setAddress] = useState(organization.address || "");
  const [phone, setPhone] = useState(organization.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/organization/${organization.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, address, phone }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      alert("Update failed ❌");
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="md" radius="lg" p="xl" withBorder>
        
        <Title order={2} mb="sm">
          Edit Organization
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Organization Name"
              placeholder="Enter organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              label="Address"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              mt="md"
              radius="md"
            >
              Update Organization
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}