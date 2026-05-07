"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthProvider>
  );
}
