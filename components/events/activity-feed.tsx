"use client";

// ═══════════════════════════════════════════════════════════════
// Activity Feed — Real-time stream of contract events
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { useEventPoller } from "@/lib/events/event-poller";
import { EVENT_CONFIG, timeAgo, truncateAddress, getExplorerTxLink } from "@/lib/utils";
import { Activity, ExternalLink } from "lucide-react";

export function ActivityFeed() {
  const { events, isPolling } = useEventPoller(true);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
      <div className="p-5 border-b border-slate-800 bg-slate-800/30 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Live Activity</h2>
          </div>
          {isPolling && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Activity className="w-8 h-8 opacity-20" />
            <p className="text-sm">Listening for network events...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => {
              const config = EVENT_CONFIG[event.type] || {
                label: event.action,
                color: "text-slate-400",
                icon: "🔔",
              };

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl leading-none mt-1">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-sm font-bold ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {timeAgo(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-300 mb-2">
                        {event.type === "creator_registered" && (
                          <p>
                            <span className="font-semibold text-white">{event.data.name as string}</span> registered as a creator
                          </p>
                        )}
                        {event.type === "membership_created" && (
                          <p>
                            Subscribed to <span className="font-semibold text-white">{event.data.creator as string || "creator"}</span>
                          </p>
                        )}
                        {event.type === "membership_renewed" && (
                          <p>
                            Renewed membership for <span className="font-semibold text-white">{event.data.creator as string || "creator"}</span>
                          </p>
                        )}
                        {event.type === "membership_cancelled" && (
                          <p>
                            Cancelled membership with <span className="font-semibold text-white">{event.data.creator as string || "creator"}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-700/50">
                        <span className="font-mono text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded">
                          {truncateAddress(event.walletAddress)}
                        </span>
                        
                        {event.txHash && (
                          <a
                            href={getExplorerTxLink(event.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                          >
                            View TX <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
