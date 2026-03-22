import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import Providers from "./providers";
import Script from "next/script"; 
import Navbar from "../components/Navbar";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <ServiceWorkerRegister />
          {children}
        </Providers>

        {/* ✅ Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}