/**
 * Hook to mint a compressed NFT
 * 
 * Two modes:
 * 1. With NEXT_PUBLIC_MERKLE_TREE_ADDRESS: Uses pre-created tree, user signs & pays
 * 2. Without: Uses Helius Mint API (server-side signing)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWallet } from '@/components/solana/solana-provider';
// Mint functionality using Helius API

interface MintCNFTParams {
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Upload metadata to decentralized storage
 * 
 * ⚠️ TEMPORARY SOLUTION:
 * Returns a mock Arweave-style URL with a hash of the metadata.
 * In production, you MUST upload to real storage (Arweave/IPFS).
 * 
 * For production implementation:
 * 1. Upload image to Arweave/IPFS
 * 2. Create metadata JSON with image URI
 * 3. Upload metadata JSON to Arweave/IPFS
 * 4. Return the metadata URI
 * 
 * Tools: Metaplex Sugar CLI, Bundlr, nft.storage, Pinata
 */
function uploadMetadata(params: MintCNFTParams): string {
  // Create a deterministic hash from the NFT name for testing
  const hash = Array.from(params.name)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(36)
    .padStart(43, 'x'); // Arweave hashes are 43 chars
  
  // Return a mock Arweave URL (max 200 chars for Bubblegum)
  // This is just for testing - in production, this must be a REAL uploaded metadata file
  const mockUri = `https://arweave.net/${hash}`;
  
  console.log('📝 Mock metadata URI:', mockUri);
  console.log('   Name:', params.name);
  console.log('   Symbol:', params.symbol);
  console.log('   ⚠️  Remember: Upload real metadata to Arweave/IPFS for production!');
  
  return mockUri;
}

/**
 * Mint a compressed NFT using Helius Mint API
 * This doesn't require wallet signature - Helius mints it for you
 */
async function mintWithHeliusAPI(
  params: MintCNFTParams,
  walletAddress: string,
): Promise<{ signature: string; assetId: string }> {
  
  // Get Helius RPC URL from server (keeps API key secure)
  const rpcResponse = await fetch('/api/helius-rpc-url');
  const { rpcUrl } = await rpcResponse.json();
  
  if (!rpcUrl) {
    throw new Error('Failed to get Helius RPC URL from server');
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'helius-mint',
      method: 'mintCompressedNft',
      params: {
        name: params.name,
        symbol: params.symbol,
        owner: walletAddress,
        description: params.description || `A compressed NFT: ${params.name}`,
        attributes: [
          {
            trait_type: 'Type',
            value: 'Compressed NFT',
          },
          {
            trait_type: 'Created',
            value: new Date().toISOString(),
          },
        ],
        imageUrl: params.imageUrl || 'https://arweave.net/placeholder-image',
        externalUrl: '',
        sellerFeeBasisPoints: 500,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Helius API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Helius RPC error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return {
    signature: data.result.signature,
    assetId: data.result.assetId,
  };
}

export const useMintCNFT = () => {
  const { account, connected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: MintCNFTParams) => {
      // Enhanced wallet connection check with detailed logging
      console.log('🔍 Wallet state:', {
        connected,
        address: account?.address,
      });

      if (!connected || !account?.address) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Use Helius API for minting (no signature required)
      console.log('⚡ Using Helius Mint API - no signature required');
      return await mintWithHeliusAPI(params, account.address);
    },
    onSuccess: (data) => {
      toast.success('🎉 cNFT Minted Successfully!', {
        description: `Asset ID: ${data.assetId.substring(0, 8)}...`,
        duration: 5000,
      });

      // Wait for Helius indexing before refetching
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['user-cnfts'] });
      }, 3000);
      
      // Refetch again after 10 seconds to be sure
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['user-cnfts'] });
      }, 10000);
    },
    onError: (error: Error) => {
      console.error('Mint cNFT error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('NEXT_PUBLIC_MERKLE_TREE_ADDRESS')) {
        errorMessage = 'Merkle tree not configured. Check TREE_SETUP_GUIDE.md';
      }
      
      toast.error('Failed to Mint cNFT', {
        description: errorMessage,
        duration: 8000,
      });
    },
  });
};
