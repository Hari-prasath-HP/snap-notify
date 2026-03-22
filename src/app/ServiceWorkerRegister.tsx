"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async () => {
          console.log("✅ Service Worker Registered");

          // 🔥 ADD THIS LINE
          await navigator.serviceWorker.ready;

          console.log("🔥 Service Worker Ready");
        })
        .catch((err) =>
          console.error("❌ Service Worker registration failed:", err)
        );
    }
  }, []);

  return null;
}