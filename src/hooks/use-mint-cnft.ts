/**
 * Hook to mint a compressed NFT
 * 
 * Currently uses Helius Mint API for simplicity.
 * To enable user-signed minting:
 * 1. Create a Merkle tree (see TREE_SETUP_GUIDE.md)
 * 2. Set NEXT_PUBLIC_MERKLE_TREE_ADDRESS in .env
 * 3. Implement Metaplex Bubblegum minting with wallet-ui signing
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWallet } from '@/components/solana/solana-provider';

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
 */
function uploadMetadata(params: MintCNFTParams): string {
  const hash = Array.from(params.name)
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(36)
    .padStart(43, 'x');
  
  const mockUri = `https://arweave.net/${hash}`;
  
  console.log('📝 Mock metadata URI:', mockUri);
  console.log('   ⚠️  Remember: Upload real metadata to Arweave/IPFS for production!');
  
  return mockUri;
}

/**
 * Mint cNFT using Helius Mint API
 * Helius handles the minting - no user signature required
 * 
 * Note: For production, consider using Metaplex Bubblegum with user signing
 */
async function mintWithHeliusAPI(
  params: MintCNFTParams,
  walletAddress: string,
): Promise<{ signature: string; assetId: string }> {
  
  const rpcResponse = await fetch('/api/helius-rpc-url');
  const { rpcUrl } = await rpcResponse.json();
  
  if (!rpcUrl) {
    throw new Error('Failed to get RPC URL');
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      if (!connected || !account?.address) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      console.log('⚡ Using Helius Mint API');
      return await mintWithHeliusAPI(params, account.address);
    },
    onSuccess: () => {
      toast.success('🎉 cNFT Minted Successfully!', {
        description: 'Your cNFT has been minted on Solana Devnet',
        duration: 5000,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['user-cnfts'] });
      }, 3000);
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['user-cnfts'] });
      }, 10000);
    },
    onError: (error: Error) => {
      console.error('❌ Mint cNFT error:', error);
      toast.error('Failed to Mint cNFT', {
        description: error.message,
        duration: 8000,
      });
    },
  });
};
