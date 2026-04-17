"use client";

import { SessionProvider } from "next-auth/react";
import { CartSlideOver } from "@/components/cart/CartSlideOver";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CartSlideOver />
    </SessionProvider>
  );
}
