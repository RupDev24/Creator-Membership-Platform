// ═══════════════════════════════════════════════════════════════
// Contract Client — High-Level Contract Interaction Layer
// ═══════════════════════════════════════════════════════════════
// This module provides typed functions for interacting with the
// Creator Membership smart contract.

import * as StellarSdk from "@stellar/stellar-sdk";
import {
  getSorobanServer,
  getContractId,
  getNetworkPassphrase,
  simulateTransaction,
  assembleTransaction,
  submitTransaction,
} from "./soroban-client";
import type {
  CreatorProfile,
  Membership,
  LeaderboardEntry,
  Tier,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────

function getContract(): StellarSdk.Contract {
  return new StellarSdk.Contract(getContractId());
}

/**
 * Build, simulate, and prepare a contract invocation transaction.
 * Returns the XDR ready for signing.
 */
async function prepareContractCall(
  sourceAddress: string,
  method: string,
  ...args: StellarSdk.xdr.ScVal[]
): Promise<{ txXdr: string; tx: StellarSdk.Transaction }> {
  const server = getSorobanServer();
  const contract = getContract();
  const account = await server.getAccount(sourceAddress);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate
  const simulation = await simulateTransaction(tx);
  const assembled = assembleTransaction(tx, simulation);

  return {
    txXdr: assembled.toXDR(),
    tx: assembled,
  };
}

/**
 * Execute a read-only contract query (no signing needed).
 */
async function queryContract(
  method: string,
  ...args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.xdr.ScVal | null> {
  const server = getSorobanServer();
  const contract = getContract();

  // Use a dummy source for read-only queries
  const dummySource = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

  try {
    const account = await server.getAccount(dummySource).catch(() => {
      // Create a minimal account for simulation
      return new StellarSdk.Account(dummySource, "0");
    });

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      return simulation.result?.retval ?? null;
    }
    return null;
  } catch (error) {
    console.error(`Query ${method} failed:`, error);
    return null;
  }
}

// ─── ScVal Conversion Helpers ─────────────────────────────────

function scValToString(val: StellarSdk.xdr.ScVal): string {
  return StellarSdk.scValToNative(val);
}

function scValToNumber(val: StellarSdk.xdr.ScVal): number {
  return Number(StellarSdk.scValToNative(val));
}

function addressToScVal(address: string): StellarSdk.xdr.ScVal {
  return new StellarSdk.Address(address).toScVal();
}

function u64ToScVal(value: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: "u64" });
}

function u32ToScVal(value: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: "u32" });
}

function stringToScVal(value: string): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: "string" });
}

function tiersToScVal(tiers: Tier[]): StellarSdk.xdr.ScVal {
  const tierVals = tiers.map((tier) =>
    StellarSdk.nativeToScVal(
      {
        name: tier.name,
        price: tier.price,
        duration_days: tier.duration_days,
      },
      {
        type: {
          name: ["symbol"],
          price: ["u64"],
          duration_days: ["u64"],
        } as unknown as undefined,
      }
    )
  );
  return StellarSdk.xdr.ScVal.scvVec(tierVals);
}

// ─── Read Functions ───────────────────────────────────────────

/**
 * Get the total number of creators.
 */
export async function getCreatorCount(): Promise<number> {
  const result = await queryContract("get_creator_count");
  return result ? scValToNumber(result) : 0;
}

/**
 * Get the total number of subscriptions.
 */
export async function getSubscriptionCount(): Promise<number> {
  const result = await queryContract("get_subscription_count");
  return result ? scValToNumber(result) : 0;
}

/**
 * Get a creator profile by ID.
 */
export async function getCreator(creatorId: number): Promise<CreatorProfile | null> {
  const result = await queryContract("get_creator", u64ToScVal(creatorId));
  if (!result) return null;

  try {
    const native = StellarSdk.scValToNative(result);
    return {
      id: Number(native.id),
      address: native.address,
      name: native.name,
      tiers: (native.tiers || []).map((t: Record<string, unknown>) => ({
        name: String(t.name),
        price: BigInt(t.price as string | number),
        duration_days: Number(t.duration_days),
      })),
      subscriber_count: Number(native.subscriber_count),
      total_earned: BigInt(native.total_earned),
      created_at: Number(native.created_at),
    } as CreatorProfile;
  } catch {
    return null;
  }
}

/**
 * Get all creators (paginated).
 */
export async function getAllCreators(
  start = 0,
  limit = 20
): Promise<CreatorProfile[]> {
  const result = await queryContract(
    "get_all_creators",
    u64ToScVal(start),
    u64ToScVal(limit)
  );
  if (!result) return [];

  try {
    const native = StellarSdk.scValToNative(result);
    return (native as Array<Record<string, unknown>>).map((c) => ({
      id: Number(c.id),
      address: String(c.address),
      name: String(c.name),
      tiers: ((c.tiers as Array<Record<string, unknown>>) || []).map((t) => ({
        name: String(t.name),
        price: BigInt(t.price as string | number),
        duration_days: Number(t.duration_days),
      })),
      subscriber_count: Number(c.subscriber_count),
      total_earned: BigInt(c.total_earned),
      created_at: Number(c.created_at),
    })) as CreatorProfile[];
  } catch {
    return [];
  }
}

/**
 * Get membership record.
 */
export async function getMembership(
  subscriber: string,
  creatorId: number
): Promise<Membership | null> {
  const result = await queryContract(
    "get_membership",
    addressToScVal(subscriber),
    u64ToScVal(creatorId)
  );
  if (!result) return null;

  try {
    const native = StellarSdk.scValToNative(result);
    return {
      subscriber: String(native.subscriber),
      creator_id: Number(native.creator_id),
      tier_index: Number(native.tier_index),
      amount_paid: BigInt(native.amount_paid),
      subscribed_at: Number(native.subscribed_at),
      expires_at: Number(native.expires_at),
      is_active: Boolean(native.is_active),
    } as Membership;
  } catch {
    return null;
  }
}

/**
 * Get leaderboard.
 */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const result = await queryContract("get_leaderboard", u64ToScVal(limit));
  if (!result) return [];

  try {
    const native = StellarSdk.scValToNative(result);
    return (native as Array<Record<string, unknown>>).map((e) => ({
      creator_id: Number(e.creator_id),
      name: String(e.name),
      subscriber_count: Number(e.subscriber_count),
      total_earned: BigInt(e.total_earned),
    })) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

// ─── Write Functions ──────────────────────────────────────────

/**
 * Register a new creator. Returns the prepared transaction XDR.
 */
export async function prepareRegisterCreator(
  creatorAddress: string,
  name: string,
  tiers: Tier[]
): Promise<string> {
  const { txXdr } = await prepareContractCall(
    creatorAddress,
    "register_creator",
    addressToScVal(creatorAddress),
    stringToScVal(name),
    tiersToScVal(tiers)
  );
  return txXdr;
}

/**
 * Subscribe to a creator. Returns the prepared transaction XDR.
 */
export async function prepareSubscribe(
  subscriberAddress: string,
  creatorId: number,
  tierIndex: number
): Promise<string> {
  const { txXdr } = await prepareContractCall(
    subscriberAddress,
    "subscribe",
    addressToScVal(subscriberAddress),
    u64ToScVal(creatorId),
    u32ToScVal(tierIndex)
  );
  return txXdr;
}

/**
 * Renew a membership. Returns the prepared transaction XDR.
 */
export async function prepareRenew(
  subscriberAddress: string,
  creatorId: number
): Promise<string> {
  const { txXdr } = await prepareContractCall(
    subscriberAddress,
    "renew",
    addressToScVal(subscriberAddress),
    u64ToScVal(creatorId)
  );
  return txXdr;
}

/**
 * Cancel a membership. Returns the prepared transaction XDR.
 */
export async function prepareCancelMembership(
  subscriberAddress: string,
  creatorId: number
): Promise<string> {
  const { txXdr } = await prepareContractCall(
    subscriberAddress,
    "cancel_membership",
    addressToScVal(subscriberAddress),
    u64ToScVal(creatorId)
  );
  return txXdr;
}

/**
 * Full contract invocation flow: prepare → sign → submit.
 */
export async function invokeContract(
  txXdr: string,
  signFn: (xdr: string) => Promise<string>
): Promise<{ hash: string; result: unknown }> {
  // Sign the transaction
  const signedXdr = await signFn(txXdr);

  // Submit and poll for result
  const response = await submitTransaction(signedXdr);

  return {
    hash: response.hash,
    result: response.returnValue
      ? StellarSdk.scValToNative(response.returnValue)
      : null,
  };
}
