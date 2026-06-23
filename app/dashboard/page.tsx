"use client";

import { useWallet } from "@/hooks/use-wallet";
import { useCreators } from "@/hooks/use-contract";
import { CreatorCard } from "@/components/creators/creator-card";
import { LayoutDashboard, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CreatorProfile } from "@/types";

export default function DashboardPage() {
  const { address, isConnected } = useWallet();
  const { data: creators, isLoading } = useCreators();
  const [myProfile, setMyProfile] = useState<CreatorProfile | null>(null);

  useEffect(() => {
    if (creators && address) {
      const profile = creators.find(
        (c) => c.address.toLowerCase() === address.toLowerCase()
      );
      setMyProfile(profile || null);
    } else {
      setMyProfile(null);
    }
  }, [creators, address]);

  if (!isConnected) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Disconnected</h2>
          <p className="text-slate-400 mb-6">
            Please connect your Stellar wallet to view your creator dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Creator Dashboard</h1>
          <p className="text-slate-400">
            Manage your profile, view your earnings, and see your subscribers.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : myProfile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-white mb-4">Your Public Profile</h3>
            <CreatorCard creator={myProfile} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="flex gap-4">
                <Link
                  href="/activity"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  View Activity
                </Link>
                <Link
                  href="/transactions"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  View Transactions
                </Link>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white mb-4">Management features coming soon!</h3>
              <p className="text-slate-400">
                In the next protocol update, you will be able to edit your tiers, withdraw specific balances, 
                and send messages to your subscribers directly from this dashboard.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-2">No Profile Found</h3>
          <p className="text-slate-400 mb-6">
            It looks like this wallet address hasn't registered as a creator yet. 
            Head over to the Creators page to set up your profile and tiers.
          </p>
          <Link
            href="/creators"
            className="inline-flex px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors"
          >
            Register Profile
          </Link>
        </div>
      )}
    </main>
  );
}
