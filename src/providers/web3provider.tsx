"use client";

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Define chains as a properly typed constant array
const wagmiChains = [base, optimism] as const;

export function WalletProvider({ children }: { children: ReactNode }) {
  // Safe access to project ID
  const projectId =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""
      : "";

  let config;
  let connectors = [];

  try {
    if (projectId) {
      const wallets = getDefaultWallets({
        appName: "NFT Gallery",
        projectId,
      });
      connectors = wallets.connectors;

      config = createConfig({
        chains: wagmiChains,
        transports: {
          [base.id]: http("https://mainnet.base.org"),
          [optimism.id]: http("https://mainnet.optimism.io"),
        },
        connectors,
      });
    } else {
      // Create minimal config without WalletConnect
      config = createConfig({
        chains: wagmiChains,
        transports: {
          [base.id]: http("https://mainnet.base.org"),
          [optimism.id]: http("https://mainnet.optimism.io"),
        },
        connectors: [],
      });
      console.warn(
        "WalletConnect projectId missing. Limited functionality available."
      );
    }
  } catch (error) {
    console.error("Error setting up wallet provider:", error);
    // Return children without wallet providers on error
    return <>{children}</>;
  }

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={lightTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
