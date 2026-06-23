"use client";

// ═══════════════════════════════════════════════════════════════
// useContract Hook — TanStack Query Hooks for Contract Interaction
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCreatorCount,
  getSubscriptionCount,
  getCreator,
  getAllCreators,
  getMembership,
  getLeaderboard,
  prepareRegisterCreator,
  prepareSubscribe,
  prepareRenew,
  prepareCancelMembership,
  invokeContract,
} from "@/lib/contract/contract-client";
import { useWallet } from "./use-wallet";
import { useTransactionStore } from "@/lib/transaction/transaction-store";
import { toast } from "sonner";
import type { Tier, TransactionType } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────

export const contractKeys = {
  all: ["contract"] as const,
  creators: () => [...contractKeys.all, "creators"] as const,
  creator: (id: number) => [...contractKeys.all, "creator", id] as const,
  creatorCount: () => [...contractKeys.all, "creatorCount"] as const,
  subscriptionCount: () => [...contractKeys.all, "subscriptionCount"] as const,
  membership: (subscriber: string, creatorId: number) =>
    [...contractKeys.all, "membership", subscriber, creatorId] as const,
  leaderboard: () => [...contractKeys.all, "leaderboard"] as const,
};

// ─── Read Hooks ───────────────────────────────────────────────

export function useCreatorCount() {
  return useQuery({
    queryKey: contractKeys.creatorCount(),
    queryFn: getCreatorCount,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useSubscriptionCount() {
  return useQuery({
    queryKey: contractKeys.subscriptionCount(),
    queryFn: getSubscriptionCount,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useCreators(start = 0, limit = 20) {
  return useQuery({
    queryKey: [...contractKeys.creators(), start, limit],
    queryFn: () => getAllCreators(start, limit),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useCreator(id: number) {
  return useQuery({
    queryKey: contractKeys.creator(id),
    queryFn: () => getCreator(id),
    refetchInterval: 15_000,
    staleTime: 10_000,
    enabled: id >= 0,
  });
}

export function useMembershipQuery(subscriber: string | null, creatorId: number) {
  return useQuery({
    queryKey: contractKeys.membership(subscriber || "", creatorId),
    queryFn: () => getMembership(subscriber!, creatorId),
    enabled: !!subscriber,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: contractKeys.leaderboard(),
    queryFn: () => getLeaderboard(limit),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

// ─── Mutation Helper ──────────────────────────────────────────

function useContractMutation<TArgs>(
  txType: TransactionType,
  prepareFn: (args: TArgs) => Promise<string>,
  description: (args: TArgs) => string
) {
  const { signTransaction, address } = useWallet();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateStatus = useTransactionStore((s) => s.updateStatus);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: TArgs) => {
      if (!address) throw new Error("Wallet not connected");

      // Step 1: Prepare the transaction
      toast.loading("Preparing transaction...", { id: "tx-prepare" });
      const txXdr = await prepareFn(args);
      toast.dismiss("tx-prepare");

      // Step 2: Sign and submit
      toast.loading("Please sign the transaction in your wallet...", { id: "tx-sign" });
      const result = await invokeContract(txXdr, signTransaction);
      toast.dismiss("tx-sign");

      // Track the transaction
      const txId = addTransaction({
        hash: result.hash,
        type: txType,
        description: description(args),
      });

      // Update status to success
      updateStatus(txId, "success");

      return result;
    },
    onSuccess: (_data, args) => {
      toast.success("Transaction successful!", {
        description: description(args),
        duration: 5000,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
    onError: (error: Error) => {
      toast.dismiss("tx-prepare");
      toast.dismiss("tx-sign");
      toast.error("Transaction failed", {
        description: error.message,
        duration: 8000,
      });
    },
  });
}

// ─── Write Hooks ──────────────────────────────────────────────

export function useRegisterCreator() {
  const { address } = useWallet();

  return useContractMutation<{ name: string; tiers: Tier[] }>(
    "register_creator",
    async ({ name, tiers }) => {
      if (!address) throw new Error("Wallet not connected");
      return prepareRegisterCreator(address, name, tiers);
    },
    ({ name }) => `Registered as creator: "${name}"`
  );
}

export function useSubscribe() {
  const { address } = useWallet();

  return useContractMutation<{ creatorId: number; tierIndex: number; creatorName?: string; tierName?: string }>(
    "subscribe",
    async ({ creatorId, tierIndex }) => {
      if (!address) throw new Error("Wallet not connected");
      return prepareSubscribe(address, creatorId, tierIndex);
    },
    ({ creatorName, tierName }) =>
      `Subscribed to ${creatorName || "creator"} — ${tierName || "selected tier"}`
  );
}

export function useRenewMembership() {
  const { address } = useWallet();

  return useContractMutation<{ creatorId: number; creatorName?: string }>(
    "renew",
    async ({ creatorId }) => {
      if (!address) throw new Error("Wallet not connected");
      return prepareRenew(address, creatorId);
    },
    ({ creatorName }) => `Renewed membership with ${creatorName || "creator"}`
  );
}

export function useCancelMembership() {
  const { address } = useWallet();

  return useContractMutation<{ creatorId: number; creatorName?: string }>(
    "cancel_membership",
    async ({ creatorId }) => {
      if (!address) throw new Error("Wallet not connected");
      return prepareCancelMembership(address, creatorId);
    },
    ({ creatorName }) => `Cancelled membership with ${creatorName || "creator"}`
  );
}
