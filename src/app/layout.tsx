import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SnapCart | 10 minutes grocery Delivery App",
  description: "10 minutes grocery Delivery App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-linear-to-b from-green-100 to-white w-full min-h-screen">{children}</body>
    </html>
  );
}
