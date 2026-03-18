import { NextRequest, NextResponse } from 'next/server';

const NEXXUS_API_URL = process.env.NEXXUS_API_URL || 'https://api.nexxus.ai';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${NEXXUS_API_URL}/status`);
    const data = await response.json();
    
    return NextResponse.json({ 
      status: 'ok',
      nexxus_connected: true,
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error',
      nexxus_connected: false,
      error: error?.message || 'Unknown error' 
    }, { status: 500 });
  }
}
