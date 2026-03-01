import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bandhan — Find Your Life Partner",
  description:
    "A modern matrimony platform to help you find meaningful, lasting connections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
