/**
 * Reusable Mint cNFT Form Component
 */

'use client';

import { useState, useCallback } from 'react';
import { useWallet as useWalletAdapter } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useMintCNFT } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Wallet } from 'lucide-react';

interface MintCNFTFormProps {
  onSuccess?: () => void;
}

export function MintCNFTForm({ onSuccess }: MintCNFTFormProps) {
  const walletAdapter = useWalletAdapter();
  const { setVisible } = useWalletModal();
  const mintCNFT = useMintCNFT();
  
  const [mintForm, setMintForm] = useState({
    name: '',
    symbol: '',
    description: '',
    imageUrl: '',
  });

  const handleWalletConnect = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleMintCNFT = async () => {
    if (!mintForm.name || !mintForm.symbol) {
      return;
    }

    try {
      await mintCNFT.mutateAsync({
        name: mintForm.name,
        symbol: mintForm.symbol,
        description: mintForm.description || undefined,
        imageUrl: mintForm.imageUrl || undefined,
      });

      // Reset form
      setMintForm({ name: '', symbol: '', description: '', imageUrl: '' });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Mint error:', error);
      // Error is already handled by the mutation's onError
    }
  };

  return (
    <div className="space-y-4 py-4">
      {!walletAdapter.connected && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Wallet Connection Required
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
            Please connect your wallet using Phantom or Solflare to mint cNFTs.
          </p>
          <Button 
            onClick={handleWalletConnect}
            className="w-full gap-2"
            variant="default"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="nft-name">Name *</Label>
        <Input
          id="nft-name"
          placeholder="My Test cNFT"
          value={mintForm.name}
          onChange={(e) => setMintForm({ ...mintForm, name: e.target.value })}
          disabled={!walletAdapter.connected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nft-symbol">Symbol *</Label>
        <Input
          id="nft-symbol"
          placeholder="TEST"
          value={mintForm.symbol}
          onChange={(e) => setMintForm({ ...mintForm, symbol: e.target.value.toUpperCase() })}
          maxLength={10}
          disabled={!walletAdapter.connected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nft-description">Description (Optional)</Label>
        <Input
          id="nft-description"
          placeholder="A test cNFT for fractionalization"
          value={mintForm.description}
          onChange={(e) => setMintForm({ ...mintForm, description: e.target.value })}
          disabled={!walletAdapter.connected}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nft-image">Image URL (Optional)</Label>
        <Input
          id="nft-image"
          type="url"
          placeholder="https://example.com/image.png"
          value={mintForm.imageUrl}
          onChange={(e) => setMintForm({ ...mintForm, imageUrl: e.target.value })}
          disabled={!walletAdapter.connected}
        />
        <p className="text-xs text-muted-foreground">
          Direct link to an image (PNG, JPG, GIF, etc.)
        </p>
      </div>
      {walletAdapter.connected && (
        <Button
          onClick={handleMintCNFT}
          disabled={!mintForm.name || !mintForm.symbol || mintCNFT.isPending}
          className="w-full"
        >
          {mintCNFT.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Mint cNFT
            </>
          )}
        </Button>
      )}
      <p className="text-xs text-muted-foreground text-center">
        This will create a compressed NFT on Solana Devnet using Helius API
      </p>
    </div>
  );
}
