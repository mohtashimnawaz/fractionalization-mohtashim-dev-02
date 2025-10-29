'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

/**
 * Standard Solana Wallet Adapter Provider
 * Provides wallet connection and transaction signing capabilities
 * Uses auto-detection of installed wallets via Wallet Standard
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

  // Use empty array to let Wallet Standard auto-detect installed wallets
  // This works better with modern Phantom and other standard-compliant wallets
  const wallets = useMemo(
    () => [],
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
