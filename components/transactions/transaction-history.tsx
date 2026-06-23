"use client";

// ═══════════════════════════════════════════════════════════════
// Transaction History — Table of all local transactions
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useTransactionStore, generateDemoTransactions } from "@/lib/transaction/transaction-store";
import { timeAgo, truncateAddress } from "@/lib/utils";
import { ExternalLink, CheckCircle2, XCircle, Loader2, ArrowUpRight, Clock, FileText } from "lucide-react";

export function TransactionHistory() {
  const { transactions, addTransaction, updateStatus } = useTransactionStore();

  // Load demo data if empty
  useEffect(() => {
    if (transactions.length === 0) {
      const demoTxs = generateDemoTransactions();
      demoTxs.forEach((tx) => {
        const id = addTransaction({
          hash: tx.hash,
          type: tx.type,
          description: tx.description,
        });
        updateStatus(id, tx.status, tx.errorMessage);
      });
    }
  }, [transactions.length, addTransaction, updateStatus]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <FileText className="w-12 h-12 opacity-20 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
        <p className="text-sm max-w-sm text-center">
          When you interact with the Soroban smart contract, your transactions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium tracking-wider">Description</th>
              <th className="px-6 py-4 font-medium tracking-wider">Type</th>
              <th className="px-6 py-4 font-medium tracking-wider">Time</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  {tx.status === "success" && (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Success</span>
                    </div>
                  )}
                  {tx.status === "failed" && (
                    <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full w-fit">
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wide">Failed</span>
                    </div>
                  )}
                  {tx.status === "pending" && (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-200">{tx.description}</p>
                  {tx.errorMessage && (
                    <p className="text-xs text-red-400 mt-1">{tx.errorMessage}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded uppercase">
                    {tx.type.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-400 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeAgo(tx.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <a
                    href={tx.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-mono text-sm bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {truncateAddress(tx.hash, 4)}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
