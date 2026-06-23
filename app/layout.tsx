import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TransactionToastProvider } from "@/components/transactions/transaction-toast";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StellarMembr — Decentralized Creator Memberships",
  description: "On-chain creator subscriptions powered by Stellar and Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen antialiased flex flex-col`}>
        <Providers>
          <Navbar />
          <TransactionToastProvider />
          <Toaster 
            theme="dark" 
            position="bottom-right" 
            toastOptions={{
              className: "bg-slate-900 border border-slate-800 text-slate-200",
            }}
          />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
