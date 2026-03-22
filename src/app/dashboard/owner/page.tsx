"use client";

import {
  Container,
  Title,
  TextInput,
  Button,
  Card,
  Grid,
  FileInput,
  Notification,
  Space,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerDashboard() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name) {
      setError("Organization name is required");
      return;
    }

    try {
      // 1️⃣ Create organization
      const orgForm = new FormData();

        orgForm.append("name", name);
        orgForm.append("address", address);
        orgForm.append("phone", phone);

        const orgRes = await fetch("/api/organization", {
          method: "POST",
          body: orgForm,
        });

      if (!orgRes.ok) {
        setError("Failed to create organization");
        return;
      }

      const orgData = await orgRes.json();
      console.log("Organization API response:", orgData);
      const organizationId = orgData.organization.id;

      // 2️⃣ Upload logo if exists
      if (logo) {
        const logoForm = new FormData();

        logoForm.append("file", logo);
        logoForm.append("organizationId", organizationId);

        const uploadRes = await fetch("/api/upload-logo", {
          method: "POST",
          body: logoForm,
        });

        if (!uploadRes.ok) {
          setError("Organization created but logo upload failed");
          return;
        }
      }

      setSuccess("Organization created successfully");

      setName("");
      setAddress("");
      setPhone("");
      setLogo(null);
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <Container size="sm" mt="xl">

      <Title order={2} mb="lg">
        Owner Dashboard
      </Title>

      <Card shadow="md" padding="lg" radius="md" withBorder>

        <Title order={4} mb="md">
          Create Organization
        </Title>

        {error && (
          <>
            <Notification color="red">{error}</Notification>
            <Space h="sm" />
          </>
        )}

        {success && (
          <>
            <Notification color="green">{success}</Notification>
            <Space h="sm" />
          </>
        )}

        <form onSubmit={handleSubmit}>

          <Grid>

            <Grid.Col span={12}>
              <TextInput
                label="Organization Name"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <FileInput
                label="Organization Logo"
                placeholder="Upload logo"
                accept="image/*"
                value={logo}
                onChange={setLogo}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Address"
                placeholder="Organization address"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Button type="submit" fullWidth>
                Create Organization
              </Button>
            </Grid.Col>

          </Grid>

        </form>

      </Card>

    </Container>
  );
}