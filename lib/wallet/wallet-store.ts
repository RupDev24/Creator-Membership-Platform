"use client";

// ═══════════════════════════════════════════════════════════════
// Wallet Store — Zustand Global State for Wallet
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import type { WalletState, WalletStatus } from "@/types";
import {
  initializeWalletKit,
  requestWalletAddress,
  signTransaction as walletSignTx,
  getWalletErrorMessage,
} from "./stellar-wallets";
import { NETWORKS } from "@/lib/utils";

interface WalletStore extends WalletState {
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (txXdr: string) => Promise<string>;
  fetchBalance: () => Promise<void>;
  setError: (error: string | null) => void;
  setStatus: (status: WalletStatus) => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  address: null,
  status: "disconnected",
  networkPassphrase: NETWORKS.testnet.passphrase,
  balance: null,
  error: null,

  setError: (error) => set({ error }),
  setStatus: (status) => set({ status }),

  connect: async () => {
    set({ status: "connecting", error: null });

    try {
      // Initialize the wallet kit (lazy load)
      await initializeWalletKit();

      // Request user's address
      const address = await requestWalletAddress();

      set({
        address,
        status: "connected",
        error: null,
      });

      // Fetch balance in the background
      get().fetchBalance();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const friendlyMessage = getWalletErrorMessage(message);
      set({
        status: "error",
        error: friendlyMessage,
        address: null,
      });
    }
  },

  disconnect: () => {
    set({
      address: null,
      status: "disconnected",
      balance: null,
      error: null,
    });
  },

  signTransaction: async (txXdr: string) => {
    const { address } = get();
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedXdr = await walletSignTx(txXdr, address);
      return signedXdr;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const friendlyMessage = getWalletErrorMessage(message);
      set({ error: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  },

  fetchBalance: async () => {
    const { address } = get();
    if (!address) return;

    try {
      const response = await fetch(
        `${NETWORKS.testnet.horizonUrl}/accounts/${address}`
      );

      if (!response.ok) {
        // Account might not be funded yet
        set({ balance: "0" });
        return;
      }

      const data = await response.json();
      const nativeBalance = data.balances?.find(
        (b: { asset_type: string }) => b.asset_type === "native"
      );
      set({ balance: nativeBalance?.balance || "0" });
    } catch {
      set({ balance: "0" });
    }
  },
}));
