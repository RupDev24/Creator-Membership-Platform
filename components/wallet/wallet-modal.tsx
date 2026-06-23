"use client";

// ═══════════════════════════════════════════════════════════════
// Wallet Selection Modal — Multi-wallet selection dialog
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ArrowRight } from "lucide-react";
import { WALLET_MODULES } from "@/lib/wallet/stellar-wallets";
import { useWallet } from "@/hooks/use-wallet";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, isConnecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    await connect();
    onClose();
    setSelectedWallet(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="rounded-3xl bg-slate-900 border border-slate-700/50 shadow-2xl shadow-black/40 overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Connect Wallet</h2>
                      <p className="text-xs text-slate-400">Select a wallet to continue</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Wallet List */}
              <div className="px-4 pb-4 space-y-1.5">
                {WALLET_MODULES.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={isConnecting}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                      selectedWallet === wallet.id
                        ? "bg-violet-600/20 border border-violet-500/40"
                        : "hover:bg-slate-800/80 border border-transparent"
                    }`}
                  >
                    <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors">
                      {wallet.icon}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{wallet.name}</p>
                      <p className="text-xs text-slate-500">Browser Extension</p>
                    </div>
                    {selectedWallet === wallet.id && isConnecting ? (
                      <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
                <p className="text-xs text-slate-500 text-center">
                  By connecting, you agree to the Terms of Service.
                  <br />
                  New to Stellar?{" "}
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Get Freighter →
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
