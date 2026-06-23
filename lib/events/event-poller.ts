"use client";

// ═══════════════════════════════════════════════════════════════
// Event Poller — Real-Time Contract Event Streaming
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";
import { getContractEvents, getSorobanServer } from "@/lib/contract/soroban-client";
import { getContractId } from "@/lib/contract/soroban-client";
import { useEventStore, generateDemoEvents } from "./event-store";
import type { ContractEvent, ContractEventType } from "@/types";
import * as StellarSdk from "@stellar/stellar-sdk";

const POLL_INTERVAL_MS = 6000; // Poll every 6 seconds (~1 ledger)

/**
 * Parse a Soroban event into our ContractEvent type.
 */
function parseContractEvent(
  event: StellarSdk.rpc.Api.EventResponse["events"][0]
): ContractEvent | null {
  try {
    const topics = event.topic.map((t) => StellarSdk.scValToNative(t));
    const topicStr = String(topics[0] || "").toLowerCase();

    let type: ContractEventType;
    let action: string;

    if (topicStr.includes("creator") && topicStr.includes("register")) {
      type = "creator_registered";
      action = "Creator Registered";
    } else if (topicStr.includes("membership") && topicStr.includes("creat")) {
      type = "membership_created";
      action = "New Subscription";
    } else if (topicStr.includes("membership") && topicStr.includes("renew")) {
      type = "membership_renewed";
      action = "Membership Renewed";
    } else if (topicStr.includes("membership") && topicStr.includes("cancel")) {
      type = "membership_cancelled";
      action = "Membership Cancelled";
    } else {
      // Try matching against the event struct name topic
      const eventName = String(topics[0] || "");
      switch (eventName) {
        case "CreatorRegistered":
          type = "creator_registered";
          action = "Creator Registered";
          break;
        case "MembershipCreated":
          type = "membership_created";
          action = "New Subscription";
          break;
        case "MembershipRenewed":
          type = "membership_renewed";
          action = "Membership Renewed";
          break;
        case "MembershipCancelled":
          type = "membership_cancelled";
          action = "Membership Cancelled";
          break;
        default:
          return null; // Unknown event type
      }
    }

    // Parse data
    const data: Record<string, unknown> = {};
    if (event.value) {
      try {
        const native = StellarSdk.scValToNative(event.value);
        if (typeof native === "object" && native !== null) {
          Object.assign(data, native);
        } else {
          data.value = native;
        }
      } catch {
        data.raw = event.value.toXDR("base64");
      }
    }

    // Extract wallet address from topics
    let walletAddress = "Unknown";
    for (const topic of topics) {
      if (typeof topic === "string" && topic.startsWith("G") && topic.length === 56) {
        walletAddress = topic;
        break;
      }
    }

    return {
      id: event.id,
      type,
      timestamp: Date.now(), // Events don't carry a client timestamp directly
      walletAddress,
      action,
      data,
      ledger: event.ledger,
      txHash: event.id,
    };
  } catch (error) {
    console.warn("Failed to parse event:", error);
    return null;
  }
}

/**
 * React hook for polling Soroban contract events.
 * Automatically starts/stops polling based on component lifecycle.
 */
export function useEventPoller(enabled = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenEvents = useRef(new Set<string>());
  const { addEvents, setLastLedger, lastLedger, setPolling, events } = useEventStore();

  const poll = useCallback(async () => {
    try {
      const contractId = getContractId();
      const response = await getContractEvents(contractId, lastLedger || undefined);

      if (response.events && response.events.length > 0) {
        const newEvents: ContractEvent[] = [];

        for (const event of response.events) {
          if (seenEvents.current.has(event.id)) continue;
          seenEvents.current.add(event.id);

          const parsed = parseContractEvent(event);
          if (parsed) {
            newEvents.push(parsed);
          }
        }

        if (newEvents.length > 0) {
          addEvents(newEvents);
        }

        // Update last ledger to the latest event's ledger + 1
        const latestLedger = Math.max(...response.events.map((e) => e.ledger));
        setLastLedger(latestLedger + 1);
      }
    } catch (error) {
      // Silently fail — polling will retry
      console.debug("Event poll error:", error);
    }
  }, [lastLedger, addEvents, setLastLedger]);

  useEffect(() => {
    if (!enabled) return;

    // Load demo events if we have none
    if (events.length === 0) {
      const demoEvents = generateDemoEvents();
      addEvents(demoEvents);
    }

    setPolling(true);

    // Start polling
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPolling(false);
    };
  }, [enabled, poll, setPolling, addEvents, events.length]);

  return {
    isPolling: useEventStore((s) => s.isPolling),
    events: useEventStore((s) => s.events),
  };
}
