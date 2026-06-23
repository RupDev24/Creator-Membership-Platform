"use client";

// ═══════════════════════════════════════════════════════════════
// Leaderboard — Displays the top creators by subscriber count
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Trophy, Users, Star } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-contract";
import { stroopsToXlm } from "@/lib/utils";

export function Leaderboard() {
  const { data: leaderboard, isLoading, isError } = useLeaderboard(10);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Top Creators</h2>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Ranked by active subscribers
        </p>
      </div>

      <div className="p-2">
        {isLoading ? (
          // Skeletons
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-6 h-6 rounded-md bg-slate-800" />
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-3 bg-slate-800 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            Failed to load leaderboard.
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            No creators registered yet. Be the first!
          </div>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((entry, index) => {
              const isTop3 = index < 3;
              const medals = ["text-amber-400", "text-slate-300", "text-amber-600"];
              
              return (
                <motion.div
                  key={entry.creator_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="w-6 flex justify-center">
                    {isTop3 ? (
                      <Star className={`w-5 h-5 fill-current ${medals[index]}`} />
                    ) : (
                      <span className="text-slate-500 font-mono text-sm">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                      {entry.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {entry.subscriber_count}
                      </span>
                      <span>{stroopsToXlm(entry.total_earned)} XLM</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
