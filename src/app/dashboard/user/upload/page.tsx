"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Button,
  Group,
  Text,
  Image,
  Stack,
  FileInput,
  Badge,
  MultiSelect,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  
  // ✅ ALWAYS array (empty = no selection)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const router = useRouter();

  // 🔹 Fetch org users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/org-users");
        const data = await res.json();

        const formatted = data.map((u: any) => ({
          value: u.id,
          label: u.name || u.email,
        }));

        setUsers(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Handle file change
  const handleFileChange = (selectedFiles: File[]) => {
    if (selectedFiles.length > 5) {
      notifications.show({
        title: "Limit exceeded",
        message: "Max 5 images allowed ❌",
        color: "red",
      });
      return;
    }
    setFiles(selectedFiles);
  };

  // 🔹 Upload handler
  const handleUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: "No files",
        message: "Please select images",
        color: "red",
      });
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    // ✅ send only if users selected
    if (selectedUsers.length > 0) {
      formData.append("targetUserIds", JSON.stringify(selectedUsers));
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        notifications.show({
          title: "Upload failed",
          message: data.error || "Something went wrong ❌",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Success",
        message: "Images uploaded successfully ✅",
        color: "green",
      });

      setFiles([]);
      setSelectedUsers([]); // reset

      router.push("/dashboard/user");
      router.refresh();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Server error ❌",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Card shadow="md" radius="lg" p="lg">
        <Stack>
          <Title order={2}>Upload Images</Title>

          <Text size="sm" c="dimmed">
            Upload up to 5 images
          </Text>

          {/* 🔹 Multi User Select */}
          <MultiSelect
            label="Tag users (optional)"
            placeholder="Select users (optional)"
            data={users}
            value={selectedUsers}
            onChange={setSelectedUsers}
            searchable
            clearable
            nothingFoundMessage="No users found"
          />

          {/* 🔹 File Input */}
          <FileInput
            multiple
            accept="image/*"
            value={files}
            onChange={handleFileChange}
            placeholder="Select images"
          />

          {/* 🔹 Preview */}
          {files.length > 0 && (
            <>
              <Group justify="space-between">
                <Text fw={500}>Preview</Text>
                <Badge>{files.length} files</Badge>
              </Group>

              <Group>
                {files.map((file, index) => (
                  <Image
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    width={100}
                    height={100}
                    radius="md"
                  />
                ))}
              </Group>
            </>
          )}

          {/* 🔹 Upload Button */}
          <Button
            fullWidth
            onClick={handleUpload}
            loading={loading}
            disabled={files.length === 0}
          >
            Upload Images
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}