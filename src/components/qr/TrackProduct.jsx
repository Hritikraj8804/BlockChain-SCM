import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Card, CardContent } from '@/components/ui/card';
import { formatUnits } from 'viem';

export function TrackProduct() {
    const { id } = useParams();

    const { data: product, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getProduct',
        args: [BigInt(id || 0)],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="text-xl font-semibold mb-2 text-foreground">Verifying Product...</div>
                    <div className="text-muted-foreground animate-pulse">Querying the blockchain for authenticity</div>
                </div>
            </div>
        );
    }

    // A basic check to see if product exists on chain: if name is empty, it usually means it doesn't exist
    if (!product || !product.name) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="max-w-md w-full border-red-500/50 bg-red-500/10">
                    <CardContent className="p-8 text-center space-y-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-red-500">WARNING: Invalid Product</h2>
                        <p className="text-foreground">This product ID was not found on the blockchain. It may be counterfeit.</p>
                        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Return Home</Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Authenticity Verification</h1>
                    <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>
                </div>

                <Card className="border-green-500/50 bg-green-500/10 overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                    <div className="bg-green-500/20 p-4 border-b border-green-500/30 flex items-center justify-center gap-2">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-green-500 tracking-wide uppercase">Verified Authentic</h2>
                    </div>

                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="col-span-1 rounded-xl overflow-hidden bg-background aspect-square border border-border flex items-center justify-center">
                                {product.imageUri ? (
                                    <img src={product.imageUri} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-muted-foreground">No image</span>
                                )}
                            </div>

                            <div className="col-span-2 space-y-4">
                                <div>
                                    <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Product Name</h3>
                                    <p className="text-lg font-semibold text-foreground">{product.name}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Description</h3>
                                    <p className="text-foreground text-sm">{product.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Price</h3>
                                        <p className="font-mono text-price font-bold">{formatUnits(product.price, 18)} ETH</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Status</h3>
                                        <p className="text-foreground">{product.isActive ? 'Active Market Listing' : 'Inactive/Archived'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <div className="p-4 bg-muted/30 border-t border-border mt-2 space-y-3">
                        <h3 className="font-semibold text-foreground pb-2 border-b border-border/50">Blockchain Provenance</h3>

                        <div className="space-y-2 text-sm font-mono break-all">
                            <div>
                                <span className="text-muted-foreground mr-2">Product ID:</span>
                                <span className="text-foreground">{product.productId.toString()}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground mr-2">Manufacturer Wallet:</span>
                                <span className="text-primary">{product.manufacturer}</span>
                            </div>
                            <div className="pt-2 text-xs text-muted-foreground flex items-start gap-1">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                This record is immutably written to the blockchain. Its origin parameter cannot be forged or altered.
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
