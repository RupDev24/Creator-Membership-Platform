"use client";

// ═══════════════════════════════════════════════════════════════
// Creator Card — Display a creator profile with tiers
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Users, TrendingUp, Clock } from "lucide-react";
import { stroopsToXlm, truncateAddress } from "@/lib/utils";
import { TierCard } from "./tier-card";
import type { CreatorProfile } from "@/types";

interface CreatorCardProps {
  creator: CreatorProfile;
  onSubscribe?: (creatorId: number, tierIndex: number) => void;
  isSubscribing?: boolean;
}

export function CreatorCard({ creator, onSubscribe, isSubscribing }: CreatorCardProps) {
  const gradients = [
    "from-violet-600/20 to-fuchsia-600/20",
    "from-blue-600/20 to-cyan-600/20",
    "from-emerald-600/20 to-teal-600/20",
    "from-amber-600/20 to-orange-600/20",
    "from-rose-600/20 to-pink-600/20",
  ];
  const gradient = gradients[creator.id % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm overflow-hidden hover:border-slate-600/50 transition-all duration-300 group"
    >
      {/* Header Gradient */}
      <div className={`h-24 bg-gradient-to-r ${gradient} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Creator Info */}
      <div className="px-5 pb-5 -mt-6 relative">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-violet-600/20 mb-3 border-4 border-slate-900">
          {creator.name.charAt(0).toUpperCase()}
        </div>

        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
          {creator.name}
        </h3>

        <p className="text-xs text-slate-500 font-mono mb-4">
          {truncateAddress(creator.address, 6)}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-2.5 rounded-xl bg-slate-800/50">
            <Users className="w-3.5 h-3.5 text-violet-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-white">{creator.subscriber_count}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Subs</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-slate-800/50">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-white">{stroopsToXlm(creator.total_earned)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">XLM</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-slate-800/50">
            <Clock className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-white">{creator.tiers.length}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tiers</p>
          </div>
        </div>

        {/* Tiers */}
        <div className="space-y-2">
          {creator.tiers.map((tier, index) => (
            <TierCard
              key={index}
              tier={tier}
              tierIndex={index}
              onSubscribe={onSubscribe ? () => onSubscribe(creator.id, index) : undefined}
              isSubscribing={isSubscribing}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
