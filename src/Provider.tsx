"use client";
import { SessionProvider } from "next-auth/react";

import React from "react";
import StoreProvider from "./redux/StoreProvider";


/**
 * Provider component that wraps the application with next-auth's SessionProvider.
 *
 * This component should be placed at the root of the app (e.g., layout) so that
 * authentication session context is available to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - React children to be wrapped by the session provider
 */
function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>{children}</StoreProvider>
    </SessionProvider>
  );
}

export default Provider;
