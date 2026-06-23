// ═══════════════════════════════════════════════════════════════
// Type Definitions — Creator Membership Platform
// ═══════════════════════════════════════════════════════════════

// ─── Contract Data Types ──────────────────────────────────────

export interface Tier {
  name: string;
  price: bigint;       // in stroops (1 XLM = 10_000_000 stroops)
  duration_days: number;
}

export interface CreatorProfile {
  id: number;
  address: string;
  name: string;
  tiers: Tier[];
  subscriber_count: number;
  total_earned: bigint;
  created_at: number;
}

export interface Membership {
  subscriber: string;
  creator_id: number;
  tier_index: number;
  amount_paid: bigint;
  subscribed_at: number;
  expires_at: number;
  is_active: boolean;
}

export interface LeaderboardEntry {
  creator_id: number;
  name: string;
  subscriber_count: number;
  total_earned: bigint;
}

// ─── Transaction Types ────────────────────────────────────────

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface TrackedTransaction {
  id: string;
  hash: string;
  status: TransactionStatus;
  type: TransactionType;
  description: string;
  timestamp: number;
  explorerLink: string;
  errorMessage?: string;
}

export type TransactionType =
  | 'register_creator'
  | 'subscribe'
  | 'renew'
  | 'cancel_membership'
  | 'initialize';

// ─── Event Types ──────────────────────────────────────────────

export type ContractEventType =
  | 'creator_registered'
  | 'membership_created'
  | 'membership_renewed'
  | 'membership_cancelled';

export interface ContractEvent {
  id: string;
  type: ContractEventType;
  timestamp: number;
  walletAddress: string;
  action: string;
  data: Record<string, unknown>;
  ledger: number;
  txHash?: string;
}

// ─── Wallet Types ─────────────────────────────────────────────

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WalletState {
  address: string | null;
  status: WalletStatus;
  networkPassphrase: string;
  balance: string | null;
  error: string | null;
}

// ─── UI Types ─────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
}
