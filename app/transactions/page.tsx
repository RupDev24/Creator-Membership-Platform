import { TransactionHistory } from "@/components/transactions/transaction-history";
import { Receipt } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Transactions Page — History of all user transactions
// ═══════════════════════════════════════════════════════════════

export default function TransactionsPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col h-screen">
      <div className="mb-6 shrink-0 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Receipt className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Transaction History</h1>
          <p className="text-slate-400">
            Track your smart contract interactions, subscriptions, and payments.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-2xl">
        <TransactionHistory />
      </div>
    </main>
  );
}
