import { NextResponse } from 'next/server';

const NEXXUS_API_URL = process.env.NEXXUS_API_URL || 'https://api.nexxus.ai';

export async function GET() {
  try {
    const response = await fetch(`${NEXXUS_API_URL}/status`);
    const data = await response.json();
    
    return NextResponse.json({ 
      status: 'ok',
      nexxus_connected: true,
      data 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      status: 'error',
      nexxus_connected: false,
      error: errorMessage 
    }, { status: 500 });
  }
}
