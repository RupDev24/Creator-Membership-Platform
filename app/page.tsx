import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap, Heart } from "lucide-react";
import { Leaderboard } from "@/components/creators/leaderboard";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-600/20 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Built on Stellar & Soroban Testnet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
            Decentralized <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Creator Memberships
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Support your favorite creators directly. Zero platform fees, instant settlements, 
            and 100% on-chain transparency powered by Stellar smart contracts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/creators"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-xl shadow-violet-600/25 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Start Exploring <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              Creator Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">On-Chain Transparency</h3>
              <p className="text-slate-400 leading-relaxed">
                Every tier, subscription, and payment is recorded on the Stellar network. No hidden fees or middleman cuts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-fuchsia-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-600/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Settlements</h3>
              <p className="text-slate-400 leading-relaxed">
                Creators receive XLM instantly when a fan subscribes. No more waiting 30 days for payouts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Direct Connection</h3>
              <p className="text-slate-400 leading-relaxed">
                True peer-to-peer support. Your wallet address is your identity, unlocking exclusive content and perks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-24 border-t border-slate-800/50 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Join the Top Creators on Soroban
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto md:mx-0">
                The ecosystem is growing fast. Register your creator profile, set up your tiers, and start climbing the ranks on the decentralized leaderboard.
              </p>
              <Link
                href="/creators"
                className="inline-flex items-center gap-2 text-violet-400 font-semibold hover:text-violet-300 transition-colors"
              >
                View all creators <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="w-full md:w-[400px]">
              <Leaderboard />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
