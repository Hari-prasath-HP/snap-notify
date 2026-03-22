"use client";

import {
  Group,
  Button,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { signOut, signIn, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <Group
      justify="space-between"
      px="xl"
      py="md"
      style={{
        backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.6)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Text
        fw={900}
        size="xl"
        style={{
          background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        SnapNotify
      </Text>

      {/* Right Section */}
      <Group>
        {session ? (
          <Menu shadow="md" width={200} radius="md">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar
                    radius="xl"
                    size={32}
                    color="blue"
                  >
                    {session.user?.name?.[0].toUpperCase()}
                  </Avatar>

                  <Text size="sm" fw={500}>
                    {session.user?.name}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>

              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
              radius="xl"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
              onClick={() => signIn(undefined, { callbackUrl: "//login" })}
            >
            Login
          </Button>
        )}
      </Group>
    </Group>
  );
}