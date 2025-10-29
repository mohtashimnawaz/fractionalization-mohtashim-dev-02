/**
 * Hook to fractionalize a compressed NFT
 * 
 * Calls the fractionalizeV1 instruction from the fractionalization program
 * Separate from cNFT minting logic
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useConnection, useWallet } from "@/components/solana/solana-provider";
import { 
  PublicKey, 
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  ComputeBudgetProgram,
  AccountMeta,
  SystemProgram,
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import type { FractionalizeParams } from '@/types';

// Import IDL directly - Next.js compatible
const fractionalizationIdl = {
  address: 'DM26SsAwF5NSGVWSebfaUBkYAG3ioLkfFnqt1Vr7pq2P',
  metadata: {
    name: 'fractionalization',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'fractionalize_v1',
      discriminator: [182, 190, 181, 8, 5, 244, 64, 234],
      accounts: [
        { name: 'fractionalizer', writable: true, signer: true },
        { name: 'vault', writable: true },
        { name: 'mint_authority' },
        { name: 'fraction_mint', writable: true },
        { name: 'metadata_account', writable: true },
        { name: 'fractionalizer_token_account', writable: true },
        { name: 'treasury' },
        { name: 'treasury_token_account', writable: true },
        { name: 'token_program' },
        { name: 'associated_token_program' },
        { name: 'system_program' },
        { name: 'bubblegum_program' },
        { name: 'compression_program' },
        { name: 'nft_asset', writable: true },
        { name: 'merkle_tree', writable: true },
        { name: 'tree_authority', writable: true },
        { name: 'leaf_delegate', optional: true },
        { name: 'log_wrapper' },
        { name: 'token_metadata_program' },
      ],
      args: [
        { name: 'total_supply', type: 'u64' },
        { name: 'min_lp_age_seconds', type: { option: 'i64' } },
        { name: 'min_reclaim_percent', type: { option: 'u8' } },
        { name: 'min_liquidity_percent', type: { option: 'u8' } },
        { name: 'min_volume_percent_30d', type: { option: 'u8' } },
        { name: 'protocol_percent_fee', type: 'u8' },
        { name: 'root', type: { array: ['u8', 32] } },
        { name: 'data_hash', type: { array: ['u8', 32] } },
        { name: 'creator_hash', type: { array: ['u8', 32] } },
        { name: 'nonce', type: 'u64' },
        { name: 'index', type: 'u32' },
        { name: 'cnft_name', type: 'string' },
        { name: 'cnft_symbol', type: 'string' },
        { name: 'cnft_uri', type: 'string' },
      ],
    },
  ],
};

const MPL_BUBBLEGUM_ID = new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY');
const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK');
const SPL_NOOP_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export function useFractionalizeCNFT() {
  const client = useConnection();
  const connection = client.rpc;
  const wallet = useWallet();
  const queryClient = useQueryClient();

  const fractionalizeMutation = useMutation<
    { signature: string; assetId: string; treasury: string },
    Error,
    FractionalizeParams
  >({
    mutationFn: async () => {
      // Fractionalization not yet implemented with wallet-ui
      // This needs to be implemented when the Anchor program is deployed
      throw new Error('Fractionalization not yet implemented. Deploy Anchor program first.');
    },

    onSuccess: (data) => {
      toast.success('🎉 NFT Fractionalized!', {
        description: `Transaction: ${data.signature.slice(0, 8)}...`,
      });

      // Invalidate queries to refresh vault data
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
      queryClient.invalidateQueries({ queryKey: ['userVaults'] });
    },
    onError: (error: Error) => {
      console.error('❌ Fractionalization failed:', error);
      toast.error('Fractionalization Failed', {
        description: error.message,
      });
    },
  });

  const fractionalize = (params: FractionalizeParams) => {
    console.log('🔄 Calling mutate with params:', params);
    return fractionalizeMutation.mutate(params);
  };

  return {
    fractionalize,
    fractionalizeAsync: fractionalizeMutation.mutateAsync,
    isPending: fractionalizeMutation.isPending,
    isSuccess: fractionalizeMutation.isSuccess,
    isError: fractionalizeMutation.isError,
    error: fractionalizeMutation.error,
    data: fractionalizeMutation.data,
    reset: fractionalizeMutation.reset,
  };
}
