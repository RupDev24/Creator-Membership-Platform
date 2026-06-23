"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WalletModal } from "./wallet/wallet-modal";
import { useWalletStore } from "@/lib/wallet/wallet-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const isModalOpen = useWalletStore((s) => s.status === "connecting");
  const cancelConnect = useWalletStore((s) => s.disconnect);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <WalletModal isOpen={isModalOpen} onClose={cancelConnect} />
    </QueryClientProvider>
  );
}
