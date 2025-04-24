"use client";

import { useState } from "react";
import { useLaceWallet } from "@/providers/lace-wallet-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export function WalletDebug() {
  const { wallet, connected, address, balance, error } = useLaceWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  const getWalletInfo = async () => {
    if (!wallet) return;

    try {
      const info: any = {
        connected,
        address,
        balance,
        error,
      };

      // Try to get network ID
      try {
        info.networkId = await wallet.getNetworkId();
      } catch (e) {
        info.networkIdError = e instanceof Error ? e.message : "Unknown error";
      }

      // Try to get UTXOs
      try {
        info.utxos = await wallet.getUtxos();
      } catch (e) {
        info.utxosError = e instanceof Error ? e.message : "Unknown error";
      }

      // Try to get available wallets
      if (typeof window !== "undefined" && (window as any).cardano) {
        info.availableWallets = Object.keys((window as any).cardano);
      }

      setWalletInfo(info);
    } catch (e) {
      console.error("Error getting wallet info:", e);
    }
  };

  if (!connected) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between">
          Wallet Debug Info
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Cardano Wallet Debug</CardTitle>
            <CardDescription>
              Technical information about your wallet connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">Connection Status:</p>
                <p className="text-sm">
                  {connected ? "Connected" : "Disconnected"}
                </p>
              </div>
              {address && (
                <div>
                  <p className="font-medium">Address:</p>
                  <p className="text-sm break-all">{address}</p>
                </div>
              )}
              {balance && (
                <div>
                  <p className="font-medium">Balance:</p>
                  <p className="text-sm">{balance} lovelace</p>
                </div>
              )}
              {error && (
                <div>
                  <p className="font-medium">Error:</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
              {walletInfo && (
                <>
                  {walletInfo.networkId !== undefined && (
                    <div>
                      <p className="font-medium">Network ID:</p>
                      <p className="text-sm">{walletInfo.networkId}</p>
                    </div>
                  )}
                  {walletInfo.networkIdError && (
                    <div>
                      <p className="font-medium">Network ID Error:</p>
                      <p className="text-sm text-red-500">
                        {walletInfo.networkIdError}
                      </p>
                    </div>
                  )}
                  {walletInfo.utxos && (
                    <div>
                      <p className="font-medium">UTXOs:</p>
                      <p className="text-sm">
                        {walletInfo.utxos.length} UTXOs found
                      </p>
                    </div>
                  )}
                  {walletInfo.utxosError && (
                    <div>
                      <p className="font-medium">UTXOs Error:</p>
                      <p className="text-sm text-red-500">
                        {walletInfo.utxosError}
                      </p>
                    </div>
                  )}
                  {walletInfo.availableWallets && (
                    <div>
                      <p className="font-medium">Available Wallets:</p>
                      <p className="text-sm">
                        {walletInfo.availableWallets.join(", ")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={getWalletInfo} variant="outline">
              Refresh Wallet Info
            </Button>
          </CardFooter>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
