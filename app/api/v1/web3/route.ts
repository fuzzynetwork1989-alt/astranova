import { NextRequest, NextResponse } from 'next/server';

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/demo';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export async function POST(request: NextRequest) {
  try {
    const { action, network, address, data } = await request.json();
    
    if (!action || !network) {
      return NextResponse.json({ error: 'Action and network are required' }, { status: 400 });
    }

    let result;

    switch (network) {
      case 'ethereum':
        result = await handleEthereumAction(action, address, data);
        break;
      case 'solana':
        result = await handleSolanaAction(action, address, data);
        break;
      default:
        return NextResponse.json({ error: 'Unsupported network' }, { status: 400 });
    }

    return NextResponse.json({ network, action, result });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}

async function handleEthereumAction(action: string, address?: string, data?: any) {
  switch (action) {
    case 'getBalance':
      if (!address) throw new Error('Address is required for balance check');
      
      const balanceResponse = await fetch(ETHEREUM_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const balanceData = await balanceResponse.json();
      const balanceWei = parseInt(balanceData.result, 16);
      const balanceEth = balanceWei / 1e18;
      
      return {
        address,
        balance: `${balanceEth.toFixed(6)} ETH`,
        balanceWei: balanceWei.toString()
      };

    case 'getTransactionCount':
      if (!address) throw new Error('Address is required for transaction count');
      
      const txCountResponse = await fetch(ETHEREUM_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const txCountData = await txCountResponse.json();
      const txCount = parseInt(txCountData.result, 16);
      
      return {
        address,
        transactionCount: txCount
      };

    default:
      throw new Error('Unsupported Ethereum action');
  }
}

async function handleSolanaAction(action: string, address?: string, data?: any) {
  switch (action) {
    case 'getBalance':
      if (!address) throw new Error('Address is required for balance check');
      
      const balanceResponse = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const balanceData = await balanceResponse.json();
      const balanceLamports = balanceData.result.value;
      const balanceSol = balanceLamports / 1e9;
      
      return {
        address,
        balance: `${balanceSol.toFixed(6)} SOL`,
        balanceLamports
      };

    case 'getAccountInfo':
      if (!address) throw new Error('Address is required for account info');
      
      const accountResponse = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [address]
        })
      });
      
      const accountData = await accountResponse.json();
      
      return {
        address,
        accountInfo: accountData.result
      };

    default:
      throw new Error('Unsupported Solana action');
  }
}
