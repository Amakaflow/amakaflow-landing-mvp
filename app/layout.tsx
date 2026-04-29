import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmakaFlow — Adaptive Training Coach",
  description: "An AI coach for hybrid athletes. Every morning your plan adapts to HRV, sleep, and yesterday's load.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
