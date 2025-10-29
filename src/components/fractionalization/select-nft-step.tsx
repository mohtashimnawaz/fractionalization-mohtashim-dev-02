/**
 * Step 1: Select NFT for fractionalization
 * Now using Helius DAS API to fetch compressed NFTs only
 */

'use client';

import { useState } from 'react';
import { useUserCNFTs } from '@/hooks';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFractionalizationStore } from '@/stores';
import { FractionalizationStep } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, RefreshCw, Plus } from 'lucide-react';
import Image from 'next/image';
import { MintCNFTForm } from './mint-cnft-form';

export function SelectNFTStep() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const { data: nfts, isLoading, error, refetch } = useUserCNFTs(walletAddress);
  const { formData, updateFormData, setStep } = useFractionalizationStore();
  
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);

  const handleSelectNFT = (nftMint: string) => {
    updateFormData({ nftMint });
    setStep(FractionalizationStep.ConfigureTokens);
  };

  const handleMintSuccess = () => {
    setIsMintDialogOpen(false);
    
    // Refetch after a delay for Helius indexing
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Please connect your wallet to view your compressed NFTs
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading your compressed NFTs from Helius...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive font-medium">Failed to load compressed NFTs</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground font-semibold">
          No compressed NFTs found in your wallet
        </p>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Get Started
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Mint a compressed NFT to test the fractionalization flow
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Dialog open={isMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Mint cNFT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mint Compressed NFT</DialogTitle>
                <DialogDescription>
                  Create a test compressed NFT on Solana Devnet
                </DialogDescription>
              </DialogHeader>
              <MintCNFTForm onSuccess={handleMintSuccess} />
            </DialogContent>
          </Dialog>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Your Compressed NFTs
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Wallet: {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Not connected'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {nfts.length}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              cNFT{nfts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Select a compressed NFT from your wallet to fractionalize
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Mint cNFT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mint Compressed NFT</DialogTitle>
                <DialogDescription>
                  Create a test compressed NFT on Solana Devnet
                </DialogDescription>
              </DialogHeader>
              <MintCNFTForm onSuccess={handleMintSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <Card
            key={nft.mint}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              formData.nftMint === nft.mint
                ? 'ring-2 ring-primary'
                : ''
            }`}
            onClick={() => handleSelectNFT(nft.mint)}
          >
            <div className="p-4 space-y-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                    cNFT
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold truncate">{nft.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{nft.symbol}</p>
                {nft.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {nft.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
