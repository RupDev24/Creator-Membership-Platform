"use client";

// ═══════════════════════════════════════════════════════════════
// useWallet Hook — Wallet Connection & Interaction
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect } from "react";
import { useWalletStore } from "@/lib/wallet/wallet-store";
import { toast } from "sonner";

export function useWallet() {
  const store = useWalletStore();

  // Show error toasts when wallet errors occur
  useEffect(() => {
    if (store.error) {
      toast.error(store.error, {
        duration: 5000,
      });
    }
  }, [store.error]);

  const connect = useCallback(async () => {
    try {
      await store.connect();
      if (store.status === "connected") {
        toast.success("Wallet connected successfully!", {
          description: `Address: ${store.address?.slice(0, 8)}...`,
        });
      }
    } catch {
      // Error already handled by the store
    }
  }, [store]);

  const disconnect = useCallback(() => {
    store.disconnect();
    toast.info("Wallet disconnected");
  }, [store]);

  const signTransaction = useCallback(
    async (txXdr: string) => {
      try {
        return await store.signTransaction(txXdr);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to sign";
        toast.error(message);
        throw error;
      }
    },
    [store]
  );

  return {
    address: store.address,
    isConnected: store.status === "connected",
    isConnecting: store.status === "connecting",
    balance: store.balance,
    error: store.error,
    status: store.status,
    networkPassphrase: store.networkPassphrase,
    connect,
    disconnect,
    signTransaction,
    fetchBalance: store.fetchBalance,
  };
}
