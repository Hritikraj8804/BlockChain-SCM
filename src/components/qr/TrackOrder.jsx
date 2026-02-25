import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Card, CardContent } from '@/components/ui/card';
import { formatUnits } from 'viem';
import { getOrderStatusText } from '@/utils/tracking-mapper';

export function TrackOrder() {
    const { id } = useParams();

    // Fetch the Order
    const { data: order, isLoading: orderLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getOrder',
        args: [BigInt(id || 0)],
    });

    // Fetch Return Request if applicable
    const { data: returnRequest } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getReturnByBookingId',
        args: [BigInt(id || 0)],
        query: {
            enabled: !!order && (order.status === 7 || order.status === 8 || order.status === 9),
        },
    });

    if (orderLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="text-xl font-semibold mb-2 text-foreground">Tracking Order...</div>
                    <div className="text-muted-foreground animate-pulse">Reading the immutable ledger</div>
                </div>
            </div>
        );
    }

    // If manufacturer address is the zero address, order doesn't exist
    if (!order || order.manufacturer === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="max-w-md w-full border-red-500/50 bg-red-500/10">
                    <CardContent className="p-8 text-center space-y-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-red-500">Invalid Waybill</h2>
                        <p className="text-foreground">This Order ID was not found on the blockchain.</p>
                        <Link to="/" className="inline-block mt-4 text-primary hover:underline">Return Home</Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusText = getOrderStatusText(order.status);

    // Format dates safely
    const orderedAt = order?.orderedAt
        ? new Date(Number(order.orderedAt.toString()) * 1000).toLocaleString()
        : 'Loading...';
    const deliveredAt = order && order.deliveredAt && Number(order.deliveredAt.toString()) > 0
        ? new Date(Number(order.deliveredAt.toString()) * 1000).toLocaleString()
        : 'Pending';

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Supply Chain Waybill</h1>
                    <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>
                </div>

                <Card className="border-primary/50 bg-card overflow-hidden shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                    <div className="bg-primary/20 p-4 border-b border-primary/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold text-primary tracking-wide uppercase">Verified Order Booking</h2>
                        </div>
                        <span className="font-mono bg-background px-3 py-1 rounded text-foreground font-bold border border-border">
                            #{id}
                        </span>
                    </div>

                    <CardContent className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between p-4 bg-muted/30 rounded-lg border border-border">
                            <div>
                                <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Current Status</h3>
                                <p className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        {order.status < 6 ? (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        ) : null}
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${order.status === 6 ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                    </span>
                                    {statusText}
                                </p>
                            </div>

                            <div className="mt-4 md:mt-0 text-left md:text-right">
                                <h3 className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Escrow Funds</h3>
                                <p className={`font-mono font-bold ${order.fundsReleased ? 'text-green-500' : 'text-amber-500'}`}>
                                    {formatUnits(order.pricePaid, 18)} ETH {order.fundsReleased ? '(Released)' : '(Locked)'}
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-foreground border-b border-border pb-2">Timeline</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order Placed:</span>
                                        <span className="text-foreground">{orderedAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivered At:</span>
                                        <span className="text-foreground">{deliveredAt}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-foreground border-b border-border pb-2">Product Info</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Product ID:</span>
                                        <span className="text-foreground">{order.productId.toString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quantity:</span>
                                        <span className="text-foreground">1 Unit</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border mt-4">
                            <h4 className="font-semibold text-foreground border-b border-border pb-2">Chain of Custody</h4>
                            <div className="space-y-3 font-mono text-xs md:text-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-2 hover:bg-muted/50 rounded">
                                    <span className="text-muted-foreground">Consumer:</span>
                                    <span className="text-foreground break-all">{order.consumer}</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-2 hover:bg-muted/50 rounded">
                                    <span className="text-muted-foreground">Manufacturer:</span>
                                    <span className="text-foreground break-all">{order.manufacturer}</span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-2 hover:bg-muted/50 rounded">
                                    <span className="text-muted-foreground">Raw Material Supplier:</span>
                                    <span className={`break-all ${order.rms === '0x0000000000000000000000000000000000000000' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                                        {order.rms === '0x0000000000000000000000000000000000000000' ? 'Not Assigned Yet' : order.rms}
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-2 hover:bg-muted/50 rounded">
                                    <span className="text-muted-foreground">Distributor:</span>
                                    <span className={`break-all ${order.distributor === '0x0000000000000000000000000000000000000000' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                                        {order.distributor === '0x0000000000000000000000000000000000000000' ? 'Not Assigned Yet' : order.distributor}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {returnRequest && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mt-6">
                                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Return Flow Active
                                </h4>
                                <div className="text-sm space-y-1 text-foreground">
                                    <p><span className="text-muted-foreground">Reason:</span> {returnRequest.reason}</p>
                                    <p><span className="text-muted-foreground">Description:</span> {returnRequest.description}</p>
                                    <div className="mt-2 pt-2 border-t border-red-500/20 font-mono text-xs">
                                        <p>Status Progression:
                                            {returnRequest.approved ? ' Approved ✅' : ' Pending Review ⏳'}
                                            {returnRequest.pickedUp ? ' -> Picked Up 🚚' : ''}
                                            {returnRequest.completed ? ' -> Completed 🏁' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
