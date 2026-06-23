"use client";

// ═══════════════════════════════════════════════════════════════
// Tier Card — Individual membership tier display
// ═══════════════════════════════════════════════════════════════

import { stroopsToXlm } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import type { Tier } from "@/types";

interface TierCardProps {
  tier: Tier;
  tierIndex: number;
  onSubscribe?: () => void;
  isSubscribing?: boolean;
}

export function TierCard({ tier, tierIndex, onSubscribe, isSubscribing }: TierCardProps) {
  const isPremium = tierIndex > 0;

  return (
    <div
      className={`relative p-4 rounded-xl border ${
        isPremium
          ? "bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 border-violet-500/30"
          : "bg-slate-800/40 border-slate-700/50"
      }`}
    >
      {isPremium && (
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4">
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-violet-500/20 flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-white" />
            POPULAR
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-semibold ${isPremium ? "text-violet-300" : "text-white"}`}>
            {tier.name}
          </h4>
          <p className="text-xs text-slate-500">{tier.duration_days} Days Access</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white flex items-baseline gap-1 justify-end">
            {stroopsToXlm(tier.price)}
            <span className="text-xs text-slate-400 font-normal">XLM</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {[
          "Exclusive content access",
          "Direct message creator",
          isPremium ? "Priority support" : null,
          isPremium ? "Monthly Q&A session" : null,
        ]
          .filter(Boolean)
          .map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <Check className={`w-3.5 h-3.5 ${isPremium ? "text-violet-400" : "text-slate-500"}`} />
              {feature}
            </div>
          ))}
      </div>

      {onSubscribe && (
        <button
          onClick={onSubscribe}
          disabled={isSubscribing}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
            isPremium
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
              : "bg-slate-700 hover:bg-slate-600 text-white"
          } ${isSubscribing ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
        >
          {isSubscribing ? "Processing..." : "Subscribe Now"}
        </button>
      )}
    </div>
  );
}
