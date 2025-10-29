# Security Update: Helius API Key Protection

## What Changed

The Helius API key is now kept **server-side only** and never exposed to the browser or network console.

## Before (Insecure)
```env
# .env.local
NEXT_PUBLIC_HELIUS_API_KEY=your-key-here  # ❌ Exposed in browser
```

Client-side code directly called Helius with the key visible in network requests.

## After (Secure)
```env
# .env
HELIUS_API_KEY=your-key-here  # ✅ Server-side only
```

All Helius API calls now go through Next.js API routes that proxy the requests server-side.

## Architecture

### API Proxy Routes

1. **`/api/helius`** - Proxies DAS API calls (getAsset, getAssetProof, getAssetsByOwner)
2. **`/api/helius-rpc-url`** - Returns the Helius RPC URL for direct blockchain connections

### Updated Files

- `src/lib/helius.ts` - Uses `/api/helius` proxy
- `src/hooks/use-fractionalize-cnft.ts` - Uses `/api/helius` proxy
- `src/hooks/use-vaults.ts` - Uses `/api/helius` proxy
- `src/hooks/use-mint-cnft.ts` - Uses `/api/helius-rpc-url` for RPC endpoint
- `src/components/solana/wallet-adapter-provider.tsx` - Uses `/api/helius-rpc-url` for connection

## Benefits

✅ API key never sent to browser  
✅ API key not visible in network console  
✅ API key not exposed in client-side JavaScript  
✅ Follows Next.js security best practices  
✅ No changes needed to existing functionality  

## Environment Variables

Your `.env` file should now use:
```env
HELIUS_API_KEY=e8d45907-aaf1-4837-9bcd-b3652dcdaeb6
```

The `NEXT_PUBLIC_` prefix has been removed to keep it server-side only.
