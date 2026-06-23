"use client";

// ═══════════════════════════════════════════════════════════════
// StellarWalletsKit — Wallet Integration Layer
// ═══════════════════════════════════════════════════════════════
// This module wraps the StellarWalletsKit initialization and
// provides helper functions for wallet operations.
// It MUST only be imported in client components.

import { NETWORKS } from "@/lib/utils";

export type WalletModule = {
  id: string;
  name: string;
  icon: string;
};

// Available wallet modules with display info
export const WALLET_MODULES: WalletModule[] = [
  { id: "freighter", name: "Freighter", icon: "🦊" },
  { id: "xbull", name: "xBull", icon: "🐂" },
  { id: "albedo", name: "Albedo", icon: "🌟" },
  { id: "rabet", name: "Rabet", icon: "🐰" },
  { id: "lobstr", name: "LOBSTR", icon: "🦞" },
  { id: "hana", name: "Hana", icon: "🌸" },
];

const NETWORK = NETWORKS.testnet;

let kitInitialized = false;
let StellarWalletsKitRef: typeof import("@creit-tech/stellar-wallets-kit") | null = null;

/**
 * Lazily initialize the StellarWalletsKit.
 * This must be called client-side only.
 */
export async function initializeWalletKit() {
  if (kitInitialized) return;
  
  try {
    // Dynamic import to avoid SSR issues
    const kit = await import("@creit-tech/stellar-wallets-kit");
    StellarWalletsKitRef = kit;

    // Initialize with default modules
    if (kit.StellarWalletsKit && kit.StellarWalletsKit.init) {
      kit.StellarWalletsKit.init({
        modules: kit.defaultModules ? kit.defaultModules() : [],
      });
    }
    
    kitInitialized = true;
  } catch (error) {
    console.warn("StellarWalletsKit not available — running in demo mode", error);
    kitInitialized = false;
  }
}

/**
 * Request the user's wallet address.
 * Opens the wallet's approval dialog.
 */
export async function requestWalletAddress(): Promise<string> {
  if (!kitInitialized || !StellarWalletsKitRef) {
    // Demo mode: return a placeholder address
    return "GDEMO...PLACEHOLDER";
  }

  try {
    const { address } = await StellarWalletsKitRef.StellarWalletsKit.getAddress();
    return address;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("rejected") || message.includes("denied") || message.includes("cancel")) {
      throw new Error("WALLET_REJECTED");
    }
    if (message.includes("not found") || message.includes("not installed")) {
      throw new Error("WALLET_NOT_FOUND");
    }
    throw new Error(`WALLET_ERROR: ${message}`);
  }
}

/**
 * Sign a transaction XDR using the connected wallet.
 */
export async function signTransaction(
  txXdr: string,
  address: string
): Promise<string> {
  if (!kitInitialized || !StellarWalletsKitRef) {
    throw new Error("WALLET_NOT_FOUND");
  }

  try {
    const { signedTxXdr } = await StellarWalletsKitRef.StellarWalletsKit.signTransaction(txXdr, {
      networkPassphrase: NETWORK.passphrase,
      address,
    });
    return signedTxXdr;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("rejected") || message.includes("denied") || message.includes("cancel")) {
      throw new Error("WALLET_REJECTED");
    }
    if (message.includes("insufficient") || message.includes("balance")) {
      throw new Error("INSUFFICIENT_BALANCE");
    }
    throw new Error(`SIGN_ERROR: ${message}`);
  }
}

/**
 * Get a user-friendly error message for wallet errors.
 */
export function getWalletErrorMessage(error: string): string {
  switch (error) {
    case "WALLET_NOT_FOUND":
      return "No Stellar wallet found. Please install Freighter, xBull, or another Stellar wallet extension.";
    case "WALLET_REJECTED":
      return "Transaction was rejected by your wallet. Please try again.";
    case "INSUFFICIENT_BALANCE":
      return "Insufficient XLM balance to complete this transaction.";
    default:
      if (error.startsWith("WALLET_ERROR:")) {
        return `Wallet error: ${error.replace("WALLET_ERROR: ", "")}`;
      }
      if (error.startsWith("SIGN_ERROR:")) {
        return `Signing error: ${error.replace("SIGN_ERROR: ", "")}`;
      }
      return "An unexpected wallet error occurred. Please try again.";
  }
}
