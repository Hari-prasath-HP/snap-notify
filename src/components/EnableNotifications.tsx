"use client";

import { Button } from "@mantine/core";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function EnableNotifications() {
  const subscribeUser = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Permission denied ❌");
        return;
      }
      const VAPID_KEY =
        "BG4Ly6f80PkwTnIwy79HeM8lO0bGYf1f_ELFpoQGmYT2QMBilZ5TqutOp7HOJMm-sziVB_5OthlHM_SR8Y_YGYk";

      const convertedKey = urlBase64ToUint8Array(VAPID_KEY);

      console.log("Key length:", convertedKey.length); // 🔥 MUST be ~65
      const registration = await navigator.serviceWorker.ready;

        // 🔥 REMOVE OLD SUBSCRIPTION
        const existingSub = await registration.pushManager.getSubscription();

        if (existingSub) {
        console.log("🧹 Removing old subscription...");
        await existingSub.unsubscribe();
        }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Subscription:", subscription);

      await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      alert("Notifications enabled 🔔");
    } catch (err) {
        console.log(err)
      console.error("❌ ERROR:", err);
      alert("Something went wrong ❌");
    }
  };

  return <Button onClick={subscribeUser}>Enable Notifications</Button>;
}