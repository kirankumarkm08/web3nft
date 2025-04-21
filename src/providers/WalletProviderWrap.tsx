"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import the WalletProvider with SSR disabled
const WalletProviderNoSSR = dynamic(
  () => import("@/providers/web3provider").then((mod) => mod.WalletProvider),
  {
    ssr: false,
  }
);

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return <WalletProviderNoSSR>{children}</WalletProviderNoSSR>;
}
