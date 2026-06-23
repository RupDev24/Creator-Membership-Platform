"use client";

// ═══════════════════════════════════════════════════════════════
// Creators Page — Browse and interact with creators
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useCreators, useRegisterCreator, useSubscribe } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { CreatorCard } from "@/components/creators/creator-card";
import { RegisterForm } from "@/components/creators/register-form";
import { Leaderboard } from "@/components/creators/leaderboard";
import { Sparkles, PlusCircle, Search } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import type { Tier } from "@/types";

export default function CreatorsPage() {
  const { isConnected } = useWallet();
  const { data: creators, isLoading } = useCreators();
  const { mutate: registerCreator, isPending: isRegistering } = useRegisterCreator();
  const { mutate: subscribe, isPending: isSubscribing, variables: subscribeVars } = useSubscribe();
  
  const [searchQuery, setSearchQuery] = useState("");

  const handleRegister = (data: { name: string; tiers: Tier[] }) => {
    registerCreator(data);
  };

  const handleSubscribe = (creatorId: number, tierIndex: number) => {
    const creator = creators?.find((c) => c.id === creatorId);
    subscribe({
      creatorId,
      tierIndex,
      creatorName: creator?.name,
      tierName: creator?.tiers[tierIndex]?.name,
    });
  };

  const filteredCreators = creators?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1">
          <Tabs.Root defaultValue="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Creators</h1>
                <p className="text-slate-400">Support the people creating the content you love.</p>
              </div>

              <Tabs.List className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <Tabs.Trigger
                  value="browse"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Browse
                  </span>
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="register"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Become a Creator
                  </span>
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            {/* Browse Tab */}
            <Tabs.Content value="browse" className="focus:outline-none">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredCreators && filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onSubscribe={isConnected ? handleSubscribe : undefined}
                      isSubscribing={isSubscribing && subscribeVars?.creatorId === creator.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                  <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No creators found</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query to find who you're looking for."
                      : "There are no creators registered on the platform yet. Be the first!"}
                  </p>
                </div>
              )}
            </Tabs.Content>

            {/* Register Tab */}
            <Tabs.Content value="register" className="focus:outline-none">
              <div className="max-w-xl bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Launch Your Profile</h2>
                  <p className="text-slate-400 text-sm">
                    Create your on-chain creator profile, set up your membership tiers, and start earning XLM directly from your fans.
                  </p>
                </div>

                {!isConnected ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-3">
                    <span className="text-xl">👋</span>
                    Please connect your Stellar wallet to register as a creator.
                  </div>
                ) : (
                  <RegisterForm onSubmit={handleRegister} isSubmitting={isRegistering} />
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-6">
          <Leaderboard />
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20">
            <h3 className="font-bold text-white mb-2">Why StellarMembr?</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> 100% On-chain transparency
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Zero platform fees
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Instant XLM payouts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-violet-400">✓</span> Built on Soroban Smart Contracts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
