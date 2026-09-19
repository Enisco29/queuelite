import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "QueueLite", template: "%s · QueueLite" },
  description: "A lightweight digital waiting line for walk-in businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-black/8 bg-white/70 backdrop-blur">
          <div className="container-page flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-[-0.04em]">
              Queue<span className="text-green-700">Lite</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-bold text-green-800 hover:text-green-950"
            >
              Owner dashboard
            </Link>
          </div>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
