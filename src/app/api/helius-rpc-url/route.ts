import { NextResponse } from 'next/server';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

export async function GET() {
  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: 'Helius API key not configured on server' },
      { status: 500 }
    );
  }

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  const rpcUrl = `https://${network}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

  return NextResponse.json({ rpcUrl });
}
