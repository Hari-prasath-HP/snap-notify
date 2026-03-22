import { prisma } from "@/lib/prisma";
import { Flex, Image, Stack, Text, Paper } from "@mantine/core";

export default async function ImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
    },
  });

  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      style={{
        height: "100vh",
        backgroundColor: "black",
        gap: "20px",
      }}
    >
      {/* Image */}
      <Image
        src={image.url}
        alt="image"
        fit="contain"
        style={{
          maxWidth: "75%",
          maxHeight: "70%",
        }}
        radius="md"
      />

      {/* Details */}
      <Paper p="md" radius="md" bg="dark.6">
        <Stack gap={5}>
          <Text c="white">
            👤 Uploaded by: {image.user?.name}
          </Text>
          <Text c="white">
            🏢 Organization: {image.organization?.name}
          </Text>
        </Stack>
      </Paper>
    </Flex>
  );
}