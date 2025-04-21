"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Create a loading fallback component - no children parameter
const LoadingFallback = () => {
  return null; // Or return a loading spinner/indicator
};

// Dynamically import the WalletProvider with SSR disabled
const WalletProviderComponent = dynamic(
  () => import("./web3provider").then((mod) => mod.WalletProvider),
  {
    ssr: false,
    loading: LoadingFallback,
  }
);

export function DynamicWalletProvider({ children }: { children: ReactNode }) {
  return <WalletProviderComponent>{children}</WalletProviderComponent>;
}
