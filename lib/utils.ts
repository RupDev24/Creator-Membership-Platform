import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate a Stellar address for display.
 * e.g., "GABCD...WXYZ"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Convert stroops to XLM.
 * 1 XLM = 10,000,000 stroops
 */
export function stroopsToXlm(stroops: bigint | number): string {
  const value = Number(stroops) / 10_000_000;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

/**
 * Convert XLM to stroops.
 */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

/**
 * Get Stellar explorer link for a transaction hash.
 */
export function getExplorerTxLink(hash: string, network = "testnet"): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

/**
 * Get Stellar explorer link for a contract.
 */
export function getExplorerContractLink(contractId: string, network = "testnet"): string {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}

/**
 * Get Stellar explorer link for an account.
 */
export function getExplorerAccountLink(address: string, network = "testnet"): string {
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

/**
 * Format a relative timestamp, e.g., "2 minutes ago".
 */
export function timeAgo(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Stellar network constants.
 */
export const NETWORKS = {
  testnet: {
    name: "Testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
  },
  mainnet: {
    name: "Mainnet",
    rpcUrl: "https://soroban.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
  },
} as const;

/**
 * Event type display labels and colors.
 */
export const EVENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  creator_registered: {
    label: "Creator Registered",
    color: "text-emerald-400",
    icon: "🎨",
  },
  membership_created: {
    label: "New Subscription",
    color: "text-blue-400",
    icon: "⭐",
  },
  membership_renewed: {
    label: "Membership Renewed",
    color: "text-amber-400",
    icon: "🔄",
  },
  membership_cancelled: {
    label: "Membership Cancelled",
    color: "text-red-400",
    icon: "❌",
  },
};
