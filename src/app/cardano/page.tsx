"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NFTCard, { type NFT } from "@/components/nfts-card";
import WalletInfo from "@/components/Wallet-Info";

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [cardanoNfts, setCardanoNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type Asset = {
    unit: string;
    quantity: string;
  };

  const testStakeAddress =
    "stake1u9dqfcsge8jm2zg9ejxv8yz5ak6ap62cpezwht5xxuhk7xgswwg0j"; // Replace with actual stake address
  const blockfrostKey = "YOUR_BLOCKFROST_API_KEY"; // Replace with your API key

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCardanoNFTs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://cardano-mainnet.blockfrost.io/api/v0/accounts/${testStakeAddress}/addresses/assets`,
        {
          headers: {
            project_id: blockfrostKey,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch assets");

      const assets = await res.json();

      const nftPromises = assets.slice(0, 12).map(async (asset: Asset) => {
        const assetRes = await fetch(
          `https://cardano-mainnet.blockfrost.io/api/v0/assets/${asset.unit}`,
          {
            headers: { project_id: blockfrostKey },
          }
        );

        if (!assetRes.ok) return null;

        // const metadata = await assetRes.json();

        // return {
        //   name: metadata.onchain_metadata?.name || "Unnamed NFT",
        //   image:
        //     metadata.onchain_metadata?.image?.replace(
        //       "ipfs://",
        //       "https://ipfs.io/ipfs/"
        //     ) || "",
        //   contract: metadata.asset,
        // } as NFT;
      });

      const resolvedNFTs = (await Promise.all(nftPromises)).filter(
        Boolean
      ) as NFT[];
      setCardanoNfts(resolvedNFTs);

      if (resolvedNFTs.length === 0) {
        setError("No NFTs found for this Cardano wallet");
      }
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      setError("Something went wrong while fetching NFTs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchCardanoNFTs();
    }
  }, [isClient, fetchCardanoNFTs]);

  return (
    <main className="container mx-auto py-20 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cardano NFT Dashboard</h1>

        <Button disabled={loading} onClick={fetchCardanoNFTs}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            "Refresh NFTs"
          )}
        </Button>
      </div>

      <div className="mb-6">
        <WalletInfo
          address={"evmAddress"}
          networkName={"cardano"}
          balance={"0"}
          getExplorerUrl={(addr) => `https://basescan.org/address/${addr}`}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-[300px] w-full rounded-t-md" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cardanoNfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardanoNfts.map((nft) => (
            <NFTCard key={nft.contract} nft={nft} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Image
              src="/abstract-nft-concept.png"
              alt="No NFTs"
              width={100}
              height={100}
            />
            <p className="mt-4 text-center text-muted-foreground">
              No NFTs found in this Cardano wallet
            </p>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Try getting some NFTs on Cardano or{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={fetchCardanoNFTs}
              >
                click here
              </Button>{" "}
              to refresh
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
