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
        <header className="border-b border-neutral-200 bg-white">
          <div className="container-page flex h-16 items-center">
            <Link href="/" className="text-lg font-bold tracking-[-0.04em] text-neutral-950">
              Queue<span className="text-green-700">Lite</span>
            </Link>
          </div>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
