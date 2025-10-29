'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

/**
 * Standard Solana Wallet Adapter Provider
 * Provides wallet connection and transaction signing capabilities
 * Used alongside wallet-ui for Metaplex Bubblegum operations
 */
export function WalletAdapterProvider({ children }: WalletAdapterProviderProps) {
  // Get Helius RPC endpoint from server (keeps API key secure)
  const [endpoint, setEndpoint] = React.useState('https://api.devnet.solana.com');

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

  // Configure wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
