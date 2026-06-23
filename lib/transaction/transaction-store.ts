"use client";

// ═══════════════════════════════════════════════════════════════
// Transaction Store — Zustand Store for Transaction Tracking
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import type { TrackedTransaction, TransactionStatus, TransactionType } from "@/types";
import { generateId, getExplorerTxLink } from "@/lib/utils";

interface TransactionStore {
  transactions: TrackedTransaction[];

  // Actions
  addTransaction: (tx: {
    hash: string;
    type: TransactionType;
    description: string;
  }) => string;
  updateStatus: (id: string, status: TransactionStatus, errorMessage?: string) => void;
  getTransaction: (id: string) => TrackedTransaction | undefined;
  getPendingTransactions: () => TrackedTransaction[];
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],

  addTransaction: ({ hash, type, description }) => {
    const id = generateId();
    const tx: TrackedTransaction = {
      id,
      hash,
      status: "pending",
      type,
      description,
      timestamp: Date.now(),
      explorerLink: getExplorerTxLink(hash),
    };
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 200),
    }));
    return id;
  },

  updateStatus: (id, status, errorMessage) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, status, errorMessage } : tx
      ),
    }));
  },

  getTransaction: (id) => {
    return get().transactions.find((tx) => tx.id === id);
  },

  getPendingTransactions: () => {
    return get().transactions.filter((tx) => tx.status === "pending");
  },

  clearTransactions: () => set({ transactions: [] }),
}));

// ─── Demo Transactions ───────────────────────────────────────

export function generateDemoTransactions(): TrackedTransaction[] {
  return [
    {
      id: generateId(),
      hash: "abc123def456789012345678901234567890abcdef1234567890abcdef12345678",
      status: "success",
      type: "register_creator",
      description: "Registered as creator: \"Alice Creates\"",
      timestamp: Date.now() - 300_000,
      explorerLink: getExplorerTxLink("abc123def456"),
    },
    {
      id: generateId(),
      hash: "def789abc012345678901234567890abcdef1234567890abcdef1234567890abcd",
      status: "success",
      type: "subscribe",
      description: "Subscribed to Alice Creates — Premium Tier (20 XLM)",
      timestamp: Date.now() - 180_000,
      explorerLink: getExplorerTxLink("def789abc012"),
    },
    {
      id: generateId(),
      hash: "ghi456def789012345678901234567890abcdef1234567890abcdef1234567890ef",
      status: "failed",
      type: "subscribe",
      description: "Subscribe to Bob Builds — Basic Tier",
      timestamp: Date.now() - 60_000,
      explorerLink: getExplorerTxLink("ghi456def789"),
      errorMessage: "Insufficient balance",
    },
    {
      id: generateId(),
      hash: "pending1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      status: "pending",
      type: "renew",
      description: "Renewing membership with Alice Creates",
      timestamp: Date.now() - 10_000,
      explorerLink: getExplorerTxLink("pending12345"),
    },
  ];
}
