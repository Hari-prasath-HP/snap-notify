self.addEventListener("push", function (event) {
  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  self.registration.showNotification(data.title || "New Notification", {
    body: data.body || "",
    icon: "/icon.png",
    data: {
      url: data.url || "/dashboard",
    },
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});