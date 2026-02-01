import type { Metadata } from "next";

import "./globals.css";

import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";

export const metadata: Metadata = {
  title: "SnapCart | 10 minutes grocery Delivery App",
  description: "10 minutes grocery Delivery App",
};

/**
 * RootLayout
 *
 * Application root layout that:
 * - Defines global metadata for the app.
 * - Loads global styles.
 * - Wraps all pages with the authentication/session Provider so session
 *   context is available throughout the client.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render inside the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-linear-to-b from-green-50 to-white w-full min-h-screen">
        <Provider>
          <StoreProvider>
            <InitUser/>
            {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
