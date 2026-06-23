"use client";

// ═══════════════════════════════════════════════════════════════
// Event Store — Zustand Store for Contract Events
// ═══════════════════════════════════════════════════════════════

import { create } from "zustand";
import type { ContractEvent, ContractEventType } from "@/types";
import { generateId } from "@/lib/utils";

interface EventStore {
  events: ContractEvent[];
  lastLedger: number;
  isPolling: boolean;

  // Actions
  addEvent: (event: Omit<ContractEvent, "id">) => void;
  addEvents: (events: Omit<ContractEvent, "id">[]) => void;
  setLastLedger: (ledger: number) => void;
  setPolling: (polling: boolean) => void;
  clearEvents: () => void;
  getEventsByType: (type: ContractEventType) => ContractEvent[];
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  lastLedger: 0,
  isPolling: false,

  addEvent: (event) => {
    const newEvent: ContractEvent = {
      ...event,
      id: generateId(),
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 500), // Keep last 500 events
    }));
  },

  addEvents: (events) => {
    const newEvents = events.map((e) => ({
      ...e,
      id: generateId(),
    }));
    set((state) => ({
      events: [...newEvents, ...state.events].slice(0, 500),
    }));
  },

  setLastLedger: (ledger) => set({ lastLedger: ledger }),
  setPolling: (polling) => set({ isPolling: polling }),
  clearEvents: () => set({ events: [], lastLedger: 0 }),

  getEventsByType: (type) => {
    return get().events.filter((e) => e.type === type);
  },
}));

// ─── Demo Events (for UI development without a deployed contract) ──

export function generateDemoEvents(): ContractEvent[] {
  const addresses = [
    "GBZX...3KFG",
    "GDWN...7HPQ",
    "GARM...2JVS",
    "GCTY...9MBR",
    "GBFQ...4WND",
  ];

  const events: ContractEvent[] = [
    {
      id: generateId(),
      type: "creator_registered",
      timestamp: Date.now() - 120_000,
      walletAddress: addresses[0],
      action: "Creator Registered",
      data: { name: "Alice Creates", tiers: 3 },
      ledger: 1234567,
    },
    {
      id: generateId(),
      type: "membership_created",
      timestamp: Date.now() - 90_000,
      walletAddress: addresses[1],
      action: "New Subscription",
      data: { creator: "Alice Creates", tier: "Premium", amount: "20 XLM" },
      ledger: 1234570,
    },
    {
      id: generateId(),
      type: "membership_created",
      timestamp: Date.now() - 60_000,
      walletAddress: addresses[2],
      action: "New Subscription",
      data: { creator: "Bob Builds", tier: "Basic", amount: "5 XLM" },
      ledger: 1234580,
    },
    {
      id: generateId(),
      type: "membership_renewed",
      timestamp: Date.now() - 30_000,
      walletAddress: addresses[3],
      action: "Membership Renewed",
      data: { creator: "Alice Creates", tier: "Premium", amount: "20 XLM" },
      ledger: 1234590,
    },
    {
      id: generateId(),
      type: "creator_registered",
      timestamp: Date.now() - 15_000,
      walletAddress: addresses[4],
      action: "Creator Registered",
      data: { name: "Charlie Codes", tiers: 2 },
      ledger: 1234600,
    },
    {
      id: generateId(),
      type: "membership_cancelled",
      timestamp: Date.now() - 5_000,
      walletAddress: addresses[2],
      action: "Membership Cancelled",
      data: { creator: "Bob Builds" },
      ledger: 1234610,
    },
  ];

  return events;
}
