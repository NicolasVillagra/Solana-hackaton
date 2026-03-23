"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Hash, FileCode, ExternalLink, Copy, Check, Pickaxe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { connection, ENERGY_MINT_ADDRESS, PROGRAM_ID, getSmartContractsProgram } from "@/lib/solana-client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@solana/web3.js";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function TokenMintCard() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const wallet = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMinting, setIsMinting] = useState(false);

  const { data: tokenMint, isLoading } = useQuery({
    queryKey: ["token-mint-stats"],
    queryFn: async () => {
      try {
        const supply = await connection.getTokenSupply(ENERGY_MINT_ADDRESS);
        const signatures = await connection.getSignaturesForAddress(ENERGY_MINT_ADDRESS, { limit: 1 });
        
        return {
          totalMinted: supply.value.uiAmount || 0,
          tokenSymbol: "GAI",
          latestTransaction: signatures.length > 0 ? signatures[0].signature : "None",
          tokenMintAddress: ENERGY_MINT_ADDRESS.toString(),
          programId: PROGRAM_ID.toString(),
          decimals: supply.value.decimals,
        };
      } catch (err) {
        console.error(err);
        return null; // Fallback handled by component
      }
    },
    refetchInterval: 10000,
  });

  const handleMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({ title: "Wallet not connected", description: "Please connect your wallet first.", variant: "destructive" });
      return;
    }
    
    setIsMinting(true);
    try {
      const decimals = details?.decimals || 6;
      const amountToMint = 10;
      const mintAmount = amountToMint * Math.pow(10, decimals);
      
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationPubkey: wallet.publicKey.toString(),
          amount: mintAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mint tokens on server');
      }
      
      toast({ 
        title: "Tokens Minted!", 
        description: `Successfully minted 10 GAI tokens.`,
      });
      
      // Give RPC time to index before invalidating
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["token-mint-stats"] });
        queryClient.invalidateQueries({ queryKey: ["blockchain-activity"] });
      }, 2000);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Minting Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsMinting(false);
    }
  };

  const fallbackTokenMint = {
    totalMinted: 0,
    tokenSymbol: "GAI",
    latestTransaction: "None",
    tokenMintAddress: ENERGY_MINT_ADDRESS.toString(),
    programId: PROGRAM_ID.toString(),
    decimals: 6,
  };

  const details = tokenMint || fallbackTokenMint;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncateSignature = (sig: string) => {
    if (sig === "None") return sig;
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-to-br from-[#F49136]/5 to-white border-[#e5e0d8] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#6b6b6b] flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F49136] to-[#e07d20] rounded-lg flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              Gaia Energy Token Mint
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Minted */}
          <div className="bg-[#F6F3EC] rounded-xl p-4 text-center">
            <p className="text-xs text-[#6b6b6b] mb-1">Total Tokens Minted</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold text-[#F49136]">
                {isLoading ? "..." : details.totalMinted.toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-[#904907]">
                {details.tokenSymbol}
              </span>
            </div>
          </div>

          {/* Latest Transaction */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b6b6b]">Latest Mint TX</span>
              <button
                onClick={() => copyToClipboard(details.latestTransaction, "tx")}
                className="flex items-center gap-1 text-xs text-[#066EB5] hover:text-[#055a9a]"
                disabled={details.latestTransaction === "None"}
              >
                {copied === "tx" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <code className="block bg-[#066EB5]/5 px-3 py-2 rounded-lg text-xs font-mono text-[#066EB5] truncate">
              {truncateSignature(details.latestTransaction)}
            </code>
          </div>

          {/* Token Mint Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b6b6b] flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Token Mint Address
              </span>
              <button
                onClick={() => copyToClipboard(details.tokenMintAddress, "mint")}
                className="flex items-center gap-1 text-xs text-[#066EB5] hover:text-[#055a9a]"
              >
                {copied === "mint" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <code className="block bg-[#F6F3EC] px-3 py-2 rounded-lg text-xs font-mono text-[#904907] truncate">
              {details.tokenMintAddress}
            </code>
          </div>

          {/* Program ID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#6b6b6b] flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                Program ID
              </span>
              <button
                onClick={() => copyToClipboard(details.programId, "program")}
                className="flex items-center gap-1 text-xs text-[#066EB5] hover:text-[#055a9a]"
              >
                {copied === "program" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <code className="block bg-[#F6F3EC] px-3 py-2 rounded-lg text-xs font-mono text-[#904907] truncate">
              {details.programId}
            </code>
          </div>

          <div className="flex gap-2">
            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={isMinting}
              className="flex-1 bg-[#F49136] hover:bg-[#e07d20] text-white"
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Pickaxe className="w-4 h-4 mr-2" />
                  Mint 10 GAI
                </>
              )}
            </Button>

            {/* Explorer Button */}
            <Button
              asChild
              variant="outline"
              className="flex-none w-12 p-0 border-[#066EB5] text-[#066EB5] hover:bg-[#066EB5]/10"
            >
              <a
                href={`https://explorer.solana.com/address/${details.tokenMintAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="sr-only">View on Solana Explorer</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
