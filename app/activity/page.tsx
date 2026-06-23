import { ActivityFeed } from "@/components/events/activity-feed";

// ═══════════════════════════════════════════════════════════════
// Activity Page — Dedicated page for the real-time event feed
// ═══════════════════════════════════════════════════════════════

export default function ActivityPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col h-screen">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2">Network Activity</h1>
        <p className="text-slate-400">
          Real-time feed of all creator registrations and membership events on the Soroban smart contract.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ActivityFeed />
      </div>
    </main>
  );
}
