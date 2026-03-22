"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Group,
  Container,
  Title,
  Card,
  Text,
  Badge,
  Avatar,
  Stack,
} from "@mantine/core";

export default function UsersTable({ users }: any) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  };

  return (
    <Container size="lg" mt="xl">

      {/* 🔹 Header */}
      <Group justify="space-between" mb="lg">
        <Stack gap={0}>
          <Title order={2}>Users</Title>
          <Text size="sm" c="dimmed">
            Manage all users in your organization
          </Text>
        </Stack>

        <Button
          radius="md"
          variant="filled"
          onClick={() => router.push("/dashboard/admin/users/add")}
        >
          + Add User
        </Button>
      </Group>

      {/* 🔹 Card */}
      <Card shadow="sm" radius="lg" p="lg" withBorder>

        {users.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No users found
          </Text>
        ) : (
          <Table
            striped
            highlightOnHover
            verticalSpacing="md"
            withTableBorder
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {users.map((user: any) => (
                <Table.Tr key={user.id}>

                  {/* 👤 User Info */}
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar radius="xl" color="blue">
                        {user.name?.[0]}
                      </Avatar>

                      <div>
                        <Text fw={500}>{user.name}</Text>
                        <Text size="xs" c="dimmed">
                          ID: {user.id.slice(0, 6)}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>

                  {/* 📧 Email */}
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {user.email}
                    </Text>
                  </Table.Td>

                  {/* ⚙️ Actions */}
                  <Table.Td>
                    <Group justify="flex-end" gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/users/${user.id}/edit`
                          )
                        }
                      >
                        Edit
                      </Button>

                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>

                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}