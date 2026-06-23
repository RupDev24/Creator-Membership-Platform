"use client";

// ═══════════════════════════════════════════════════════════════
// Wallet Connect Button — Primary wallet connection trigger
// ═══════════════════════════════════════════════════════════════

import { useWallet } from "@/hooks/use-wallet";
import { truncateAddress } from "@/lib/utils";
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  if (isConnecting) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-medium cursor-wait"
        disabled
      >
        <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-white text-sm font-medium hover:border-violet-400/50 transition-all duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{truncateAddress(address, 4)}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-slate-800/95 border border-slate-700/50 backdrop-blur-xl shadow-2xl shadow-black/20 z-50"
              >
                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Address</span>
                    <div className="flex gap-1">
                      <button
                        onClick={copyAddress}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                        title="Copy address"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm font-mono text-slate-300 break-all leading-relaxed">
                    {address}
                  </p>

                  {/* Balance */}
                  <div className="pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Balance</span>
                    <p className="text-lg font-semibold text-white mt-1">
                      {balance ? `${parseFloat(balance).toFixed(2)} XLM` : "Loading..."}
                    </p>
                  </div>

                  {/* Network */}
                  <div className="pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Network</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-slate-300">Stellar Testnet</span>
                    </div>
                  </div>

                  {/* Disconnect */}
                  <button
                    onClick={() => {
                      disconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
