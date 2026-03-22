"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Grid,
  Card,
  Button,
  Avatar,
  Text,
  Group,
  Modal
} from "@mantine/core";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrganizations = async () => {
    const res = await fetch("/api/organization/list");
    const data = await res.json();
    setOrganizations(data);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const deleteOrganization = async () => {
    if (!deleteId) return;

    await fetch(`/api/organization/${deleteId}`, {
      method: "DELETE"
    });

    setDeleteId(null);
    fetchOrganizations();
  };

  return (
    <Container>

      <Title order={2}>Owner Dashboard</Title>

      <Button
        mt="md"
        onClick={() => router.push("/dashboard/owner")}
      >
        Add Organization
      </Button>

      <Grid mt="xl">

        {organizations.map((org) => (

          <Grid.Col span={4} key={org.id}>

            <Card shadow="sm" padding="lg" withBorder radius="md">

              <Avatar
                src={org.logoUrl}
                size={80}
                radius="xl"
                mx="auto"
                mb="md"
                style={{
                  border: "2px solid #e9ecef",
                  backgroundColor: "#f8f9fa"
                }}
              />

              <Title order={5} ta="center" mb="xs">
                {org.name}
              </Title>

              <Text size="sm" c="dimmed" ta="center">
                {org.address || "No address"}
              </Text>

              <Text size="sm" ta="center" mt="xs">
                {org.phone || "No phone"}
              </Text>

              {/* Buttons */}
              <Group mt="md" justify="center">

                <Button
                  size="xs"
                  onClick={() =>
                    router.push(`/dashboard/owner/edit/${org.id}`)
                  }
                >
                  Edit
                </Button>

                <Button
                  size="xs"
                  color="red"
                  onClick={() => setDeleteId(org.id)}
                >
                  Delete
                </Button>

              </Group>

            </Card>

          </Grid.Col>

        ))}

      </Grid>

      {/* Delete Confirmation Modal */}

      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Organization"
        centered
      >

        <Text mb="md">
          Are you sure you want to delete this organization?
        </Text>

        <Group justify="flex-end">

          <Button variant="default" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>

          <Button color="red" onClick={deleteOrganization}>
            Delete
          </Button>

        </Group>

      </Modal>

    </Container>
  );
}