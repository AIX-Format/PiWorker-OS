
import { NextResponse } from 'next/server';
import { MarketplaceController } from '@/core/finance/marketplace-controller';

export async function POST(request: Request) {
    try {
        const { assetId, buyerWallet } = await request.json();

        if (!assetId || !buyerWallet) {
            return NextResponse.json({ error: 'Missing assetId or buyerWallet' }, { status: 400 });
        }

        const result = await MarketplaceController.purchaseAsset(assetId, buyerWallet);
        
        return NextResponse.json({ 
            success: true, 
            message: `Asset ${result.name} purchased successfully by ${buyerWallet}.`,
            asset: result
        });
    } catch (error: any) {
        console.error('[API_PURCHASE] Error:', error);
        return NextResponse.json({ error: error.message || 'Purchase failed' }, { status: 500 });
    }
}
