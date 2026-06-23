"use client";

// ═══════════════════════════════════════════════════════════════
// Register Form — Form to register as a new creator
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { xlmToStroops } from "@/lib/utils";
import type { Tier } from "@/types";

interface RegisterFormProps {
  onSubmit: (data: { name: string; tiers: Tier[] }) => void;
  isSubmitting: boolean;
}

export function RegisterForm({ onSubmit, isSubmitting }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [tiers, setTiers] = useState<Array<{ name: string; priceXlm: string; duration: string }>>([
    { name: "Supporter", priceXlm: "10", duration: "30" },
  ]);

  const addTier = () => {
    if (tiers.length >= 3) return; // Max 3 tiers
    setTiers([...tiers, { name: "", priceXlm: "", duration: "30" }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return; // Min 1 tier
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof typeof tiers[0], value: string) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedTiers: Tier[] = tiers.map((t) => ({
      name: t.name || "Unnamed Tier",
      price: xlmToStroops(parseFloat(t.priceXlm) || 1),
      duration_days: parseInt(t.duration) || 30,
    }));

    onSubmit({ name, tiers: formattedTiers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Creator Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alice Creates"
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
        />
      </div>

      {/* Tiers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-300">
            Membership Tiers (Max 3)
          </label>
          {tiers.length < 3 && (
            <button
              type="button"
              onClick={addTier}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Tier
            </button>
          )}
        </div>

        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl relative group"
            >
              {tiers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-xs text-slate-400 mb-1">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={tier.name}
                    onChange={(e) => updateTier(index, "name", e.target.value)}
                    placeholder="e.g. VIP Access"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label className="block text-xs text-slate-400 mb-1">Price (XLM)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    value={tier.priceXlm}
                    onChange={(e) => updateTier(index, "priceXlm", e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-xs text-slate-400 mb-1">Days</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={tier.duration}
                    onChange={(e) => updateTier(index, "duration", e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || tiers.length === 0}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Registering...
          </div>
        ) : (
          "Launch Creator Profile"
        )}
      </button>
    </form>
  );
}
