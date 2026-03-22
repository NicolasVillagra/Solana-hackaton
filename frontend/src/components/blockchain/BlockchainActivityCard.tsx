"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Coins, ArrowRightLeft, FileCheck, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { connection, ENERGY_MINT_ADDRESS } from "@/lib/solana-client";

const transactionIcons: Record<string, React.ElementType> = {
  mint: Coins,
  transfer: ArrowRightLeft,
  energy_record: Zap,
  verify: FileCheck,
};

const transactionColors: Record<string, any> = {
  mint: {
    bg: "bg-[#F49136]/10",
    text: "text-[#F49136]",
    badge: "bg-[#F49136]/10 text-[#F49136] border-[#F49136]/20",
  },
  transfer: {
    bg: "bg-[#066EB5]/10",
    text: "text-[#066EB5]",
    badge: "bg-[#066EB5]/10 text-[#066EB5] border-[#066EB5]/20",
  },
  energy_record: {
    bg: "bg-green-500/10",
    text: "text-green-600",
    badge: "bg-green-500/10 text-green-600 border-green-200",
  },
  verify: {
    bg: "bg-[#904907]/10",
    text: "text-[#904907]",
    badge: "bg-[#904907]/10 text-[#904907] border-[#904907]/20",
  },
};

const transactionLabels: Record<string, string> = {
  mint: "Mint Tokens",
  transfer: "Transfer",
  energy_record: "Energy Record",
  verify: "Device Verify",
};

export function BlockchainActivityCard() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["blockchain-activity"],
    queryFn: async () => {
      try {
        const sigs = await connection.getSignaturesForAddress(ENERGY_MINT_ADDRESS, { limit: 10 });
        
        return sigs.map((sig, i) => {
          let timeString = "Unknown";
          if (sig.blockTime) {
            const date = new Date(sig.blockTime * 1000);
            const now = new Date();
            const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
            timeString = diffMins < 60 ? `${diffMins} min ago` : date.toLocaleTimeString();
          }

          // For simplicity in UI without parsing instruction data, everything to the mint is labeled as Mint
          return {
            id: sig.signature,
            signature: sig.signature,
            type: "mint",
            amount: "N/A", // Without fetching parsed transaction, amount is complex to determine
            token: "GAI",
            timestamp: timeString,
            status: sig.err ? "failed" : "confirmed",
          };
        });
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const txs = transactions || [];

  const truncateSignature = (sig: string) => {
    return `${sig.slice(0, 6)}...${sig.slice(-6)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full bg-white border-[#e5e0d8] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#6b6b6b] flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#904907] to-[#7a3d06] rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Recent Blockchain Activity
            </CardTitle>
            <Badge variant="secondary" className="bg-[#F6F3EC] text-[#6b6b6b]">
              {isLoading ? "..." : `${txs.length} txns`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {txs.map((tx, index) => {
                const Icon = transactionIcons[tx.type];
                const colors = transactionColors[tx.type];

                return (
                  <motion.a
                    key={tx.id}
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3 border-b border-[#e5e0d8] last:border-0 hover:bg-[#F6F3EC]/50 transition-colors cursor-pointer group"
                  >
                    {/* Icon */}
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.text)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#F49136] transition-colors">
                          {transactionLabels[tx.type]}
                        </span>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", colors.badge)}>
                          {tx.amount === "N/A" ? "Interact" : `+${tx.amount} ${tx.token}`}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-[#6b6b6b] truncate">
                          {truncateSignature(tx.signature)}
                        </code>
                      </div>
                    </div>

                    {/* Timestamp & Link */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-[#6b6b6b]">{tx.timestamp}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#066EB5] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
            {!isLoading && txs.length === 0 && (
              <div className="p-5 text-center text-sm text-[#6b6b6b]">
                No recent transactions found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
