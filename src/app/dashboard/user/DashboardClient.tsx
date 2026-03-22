"use client";

import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  CardSection,
  Image,
  Badge,
  Button,
  Group,
  GridCol,
  Modal,
  NumberInput,
  Indicator,
  ActionIcon,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { IconBell } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import EnableNotifications from "@/components/EnableNotifications";

type ImageType = {
  id: string;
  url: string;
};

type UserType = {
  id: string;
  imageQuota: number;
  images: ImageType[];
};

interface Props {
  user: UserType | null;
}

const PRICE_PER_SLOT = 20;


export default function DashboardClient({ user }: Props) {
  const [opened, setOpened] = useState(false);
  const [slots, setSlots] = useState(5);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpened, setNotifOpened] = useState(false);

  // 🔥 NEW: track viewed state (persisted)
  const [hasViewed, setHasViewed] = useState(false);

  const router = useRouter();

  const amount = slots * PRICE_PER_SLOT;

  // 🔔 Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);

        // 🔥 reset view when new notifications come
        if (data.length > 0) {
          const seen = localStorage.getItem("notifSeen") === "true";
          setHasViewed(seen);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, []);

  // 💳 Payment (unchanged)
  const handlePayment = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/create-order", {
        method: "POST",
        body: JSON.stringify({ slots }),
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: data.amount,
        currency: "INR",
        order_id: data.orderId,

        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              slots,
              amount,
            }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            alert("Payment successful 🎉");
            window.location.reload();
          } else {
            alert("Payment verification failed ❌");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>User Dashboard</Title>
          <Text c="dimmed" size="sm">
            Your uploaded images
          </Text>
        </div>

        <Group>
          <EnableNotifications />
          <Button component="a" href="/dashboard/user/upload">
            Upload
          </Button>

          <Button color="green" onClick={() => setOpened(true)}>
            Buy Slots
          </Button>

          {/* 🔔 Notification Bell */}
          <Indicator
            size={20}
            color="red"
            withBorder
            label={hasViewed ? 0 : notifications.length} // 🔥 FIX
            disabled={notifications.length === 0}
          >
            <ActionIcon
              variant="filled"
              color="dark"
              size="lg"
              radius="xl"
              onClick={() => {
                setNotifOpened(true);

                // 🔥 mark as viewed
                setHasViewed(true);
                localStorage.setItem("notifSeen", "true");
              }}
            >
              <IconBell size={22} />
            </ActionIcon>
          </Indicator>
        </Group>
      </Group>

      {/* Quota */}
      <Card shadow="sm" p="md" radius="md" mb="xl">
        <Group justify="space-between">
          <Text fw={500}>Remaining Slots</Text>
          <Badge color="blue" size="lg">
            {user?.imageQuota ?? 0}
          </Badge>
        </Group>
      </Card>

      {/* Images Grid */}
      <Grid gutter="lg">
        {user?.images.map((img) => (
          <GridCol span={3} key={img.id}>
            <Card
              shadow="sm"
              radius="md"
              withBorder
              style={{
                height: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CardSection>
                <Image
                  src={img.url}
                  height={150}
                  fit="cover"
                  alt="Uploaded image"
                />
              </CardSection>

              <Group justify="space-between" p="xs">
                <Text size="xs" c="dimmed">
                  Image
                </Text>
                <Badge size="xs" variant="light">
                  Active
                </Badge>
              </Group>
            </Card>
          </GridCol>
        ))}
      </Grid>

      {/* 💳 Payment Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="Buy Slots" centered>
        <NumberInput
          label="Enter number of slots"
          value={slots}
          min={5}
          step={5}
          max={50}
          onChange={(value) => setSlots(Number(value) || 5)}
        />

        <Text mt="sm">Total: ₹{amount}</Text>

        <Button fullWidth mt="md" onClick={handlePayment} loading={loading}>
          Pay ₹{amount}
        </Button>
      </Modal>

      {/* 🔔 Notification Modal */}
      <Modal opened={notifOpened} onClose={() => setNotifOpened(false)} title="Notifications" centered>
        {notifications.length === 0 ? (
          <Text>No notifications</Text>
        ) : (
          notifications.map((n) => (
            <Card key={n.id} mb="sm" withBorder>
              <Text size="sm">{n.message}</Text>

              {n.imageId && (
                <Button
                  size="xs"
                  mt="xs"
                  onClick={() => {
                    setNotifOpened(false);
                    router.push(`/image/${n.imageId}`);
                  }}
                >
                  View Image
                </Button>
              )}
            </Card>
          ))
        )}
      </Modal>
    </Container>
  );
}