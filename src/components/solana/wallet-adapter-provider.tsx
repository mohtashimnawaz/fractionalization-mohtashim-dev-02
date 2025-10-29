'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

/**
 * Standard Solana Wallet Adapter Provider
 * Provides wallet connection and transaction signing capabilities
 */
export function WalletAdapterProvider({ children }: WalletAdapterProviderProps) {
  // Get Helius RPC endpoint from server (keeps API key secure)
  const [endpoint, setEndpoint] = React.useState(clusterApiUrl('devnet'));

  React.useEffect(() => {
    fetch('/api/helius-rpc-url')
      .then(res => res.json())
      .then(data => {
        if (data.rpcUrl) {
          setEndpoint(data.rpcUrl);
        }
      })
      .catch(err => {
        console.error('Failed to fetch Helius RPC URL, using public endpoint:', err);
      });
  }, []);

  // Configure wallet adapters explicitly for better production support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
