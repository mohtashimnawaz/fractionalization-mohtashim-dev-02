import { NextRequest, NextResponse } from 'next/server';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export async function POST(request: NextRequest) {
  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: 'Helius API key not configured on server' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Helius API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Helius API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Helius API' },
      { status: 500 }
    );
  }
}
