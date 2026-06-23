"use client";

// ═══════════════════════════════════════════════════════════════
// Transaction Toast Provider — Watches the store and shows toasts
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useTransactionStore } from "@/lib/transaction/transaction-store";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function TransactionToastProvider() {
  const transactions = useTransactionStore((s) => s.transactions);
  const prevTransactionsRef = useRef(transactions);
  const shownToastsRef = useRef(new Set<string>());

  useEffect(() => {
    // Check for new or updated transactions
    const prev = prevTransactionsRef.current;
    
    for (const tx of transactions) {
      const prevTx = prev.find((p) => p.id === tx.id);
      
      // If it's a new pending tx, show toast
      if (!prevTx && tx.status === "pending" && !shownToastsRef.current.has(tx.id)) {
        shownToastsRef.current.add(tx.id);
        toast(
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              Transaction Pending
            </div>
            <p className="text-sm text-slate-400">{tx.description}</p>
            <a
              href={tx.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
            >
              View on Stellar Expert <ExternalLink className="w-3 h-3" />
            </a>
          </div>,
          { id: `tx-${tx.id}`, duration: Infinity }
        );
      }
      
      // If status changed from pending to success/failed, update toast
      if (prevTx && prevTx.status === "pending" && tx.status !== "pending") {
        if (tx.status === "success") {
          toast.success(
            <div className="flex flex-col gap-1 w-full">
              <div className="font-medium text-slate-200">{tx.description}</div>
              <a
                href={tx.explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1"
              >
                Confirmed on-chain <ExternalLink className="w-3 h-3" />
              </a>
            </div>,
            { id: `tx-${tx.id}`, duration: 5000, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> }
          );
        } else if (tx.status === "failed") {
          toast.error(
            <div className="flex flex-col gap-1 w-full">
              <div className="font-medium text-slate-200">Transaction Failed</div>
              <p className="text-sm text-red-400/80">{tx.errorMessage || "Unknown error occurred"}</p>
              <a
                href={tx.explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1"
              >
                View on Stellar Expert <ExternalLink className="w-3 h-3" />
              </a>
            </div>,
            { id: `tx-${tx.id}`, duration: 8000, icon: <XCircle className="w-5 h-5 text-red-500" /> }
          );
        }
      }
    }

    prevTransactionsRef.current = transactions;
  }, [transactions]);

  return null; // This component just manages side-effects (toasts)
}
