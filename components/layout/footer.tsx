// ═══════════════════════════════════════════════════════════════
// Footer — Site footer with Stellar branding
// ═══════════════════════════════════════════════════════════════

import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">StellarMembr</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Decentralized creator membership platform powered by Stellar and Soroban smart contracts.
              Support your favorite creators with transparent, on-chain subscriptions.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Stellar Docs", href: "https://developers.stellar.org" },
                { label: "Soroban", href: "https://soroban.stellar.org" },
                { label: "Stellar Expert", href: "https://stellar.expert" },
                { label: "Stellar Lab", href: "https://lab.stellar.org" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Creators", href: "/creators" },
                { label: "Activity Feed", href: "/activity" },
                { label: "Transaction History", href: "/transactions" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} StellarMembr. Built on Stellar Testnet.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Powered by</span>
            <span className="text-violet-400 font-medium">Soroban</span>
            <span>×</span>
            <span className="text-fuchsia-400 font-medium">Stellar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
