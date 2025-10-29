'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Wallet connection button using Solana Wallet Adapter
 * Supports Phantom, Solflare, and other standard wallets
 */
export function WalletDropdown() {
  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !h-10 !text-sm !font-medium !rounded-md !px-4" />
  );
}
