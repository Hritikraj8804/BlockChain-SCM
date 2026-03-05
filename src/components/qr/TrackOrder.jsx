import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { formatUnits } from 'viem';
import { getOrderStatusText } from '@/utils/tracking-mapper';

// ── Order status steps (matches contract OrderStatus enum) ──────────────────
const ORDER_STEPS = [
    { label: 'Order Placed', statusNum: 0 },
    { label: 'Materials Requested', statusNum: 1 },
    { label: 'Materials Dispatched', statusNum: 2 },
    { label: 'In Production', statusNum: 3 },
    { label: 'Ready to Ship', statusNum: 4 },
    { label: 'In Transit', statusNum: 5 },
    { label: 'Delivered', statusNum: 6 },
];

// Return flow steps (status 7-10 are return-related)
const RETURN_STEPS = [
    { label: 'Return Requested', statusNum: 7 },
    { label: 'Return Approved', statusNum: 8 },
    { label: 'Return In Transit', statusNum: 9 },
    { label: 'Refunded', statusNum: 10 },
];

function StatusStepper({ currentStatus }) {
    const statusNum = Number(currentStatus);
    const isReturn = statusNum >= 7;
    const steps = isReturn ? RETURN_STEPS : ORDER_STEPS;

    const getStepState = (stepStatusNum) => {
        if (isReturn) {
            if (stepStatusNum < statusNum) return 'done';
            if (stepStatusNum === statusNum) return 'active';
            return 'pending';
        }
        if (stepStatusNum < statusNum) return 'done';
        if (stepStatusNum === statusNum) return 'active';
        return 'pending';
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-start min-w-max gap-0">
                {steps.map((step, idx) => {
                    const state = getStepState(step.statusNum);
                    const isLast = idx === steps.length - 1;

                    return (
                        <div key={step.statusNum} className="flex items-start">
                            {/* Step node */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all
                  ${state === 'done' ? 'bg-teal-500 border-teal-500 text-white' : ''}
                  ${state === 'active' ? 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse' : ''}
                  ${state === 'pending' ? 'bg-muted border-border text-muted-foreground' : ''}
                `}>
                                    {state === 'done' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>
                                <span className={`text-[10px] text-center leading-tight w-16
                  ${state === 'done' ? 'text-teal-400' : ''}
                  ${state === 'active' ? 'text-primary font-semibold' : ''}
                  ${state === 'pending' ? 'text-muted-foreground' : ''}
                `}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div className={`h-0.5 w-12 mt-4 mx-1 rounded-full transition-all
                  ${state === 'done' ? 'bg-teal-500' : 'bg-border'}
                `} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Actor badge ──────────────────────────────────────────────────────────────
function ActorBadge({ label, address, color }) {
    const ZERO = '0x0000000000000000000000000000000000000000';
    const isZero = !address || address.toLowerCase() === ZERO;

    const colors = {
        blue: 'bg-blue-500/10   border-blue-500/30   text-blue-400',
        teal: 'bg-teal-500/10   border-teal-500/30   text-teal-400',
        amber: 'bg-amber-500/10  border-amber-500/30  text-amber-400',
        purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors[color]}`}>
                    {label}
                </span>
            </div>
            <span className={`font-mono text-xs break-all ${isZero ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                {isZero ? 'Not yet assigned' : address}
            </span>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function TrackOrder() {
    const { id } = useParams();

    const { data: order, isLoading: orderLoading } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getOrder',
        args: [BigInt(id || 0)],
        query: { refetchInterval: 8000 },
    });

    const statusNum = order ? Number(order.status) : -1;

    const { data: returnRequest } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getReturnByBookingId',
        args: [BigInt(id || 0)],
        query: { enabled: !!order && statusNum >= 7 },
    });

    if (orderLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-foreground font-semibold">Querying the blockchain…</div>
                    <div className="text-muted-foreground text-sm">Reading immutable ledger</div>
                </div>
            </div>
        );
    }

    const ZERO = '0x0000000000000000000000000000000000000000';
    if (!order || order.manufacturer?.toLowerCase() === ZERO) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <div className="max-w-sm w-full text-center space-y-4 p-8 rounded-2xl border border-red-500/30 bg-red-500/5">
                    <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-red-400">Invalid Waybill</h2>
                    <p className="text-muted-foreground">Order #{id} was not found on the blockchain.</p>
                    <Link to="/" className="inline-block mt-2 text-primary hover:underline text-sm">← Return Home</Link>
                </div>
            </div>
        );
    }

    const statusText = getOrderStatusText(order.status);
    const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

    const orderedAt = order?.createdAt !== undefined
        ? new Date(Number(order.createdAt.toString()) * 1000).toLocaleString()
        : '—';
    const deliveredAt = order?.deliveredAt !== undefined && Number(order.deliveredAt.toString()) > 0
        ? new Date(Number(order.deliveredAt.toString()) * 1000).toLocaleString()
        : 'Pending';

    const isDelivered = statusNum === 6;
    const isReturn = statusNum >= 7;

    return (
        <div className="min-h-screen bg-background">
            {/* ── Top bar ── */}
            <div className="border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="font-semibold text-foreground text-sm">AI Supply Chain</span>
                        <span className="text-muted-foreground text-sm">/ Waybill</span>
                    </div>
                    <Link to="/" className="text-xs text-primary hover:underline flex items-center gap-1">
                        ← Home
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">

                {/* ── Hero card ── */}
                <div className="rounded-2xl border border-primary/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.08)]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/20">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Blockchain-Verified</p>
                                <h1 className="text-lg font-bold text-foreground">Supply Chain Waybill</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isDelivered ? 'bg-green-500/15 border-green-500/30 text-green-400' :
                                isReturn ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                                    'bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse'
                                }`}>
                                {statusText}
                            </span>
                            <span className="font-mono font-bold text-foreground bg-background border border-border px-3 py-1 rounded-lg text-sm">
                                #{id}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 bg-card/20">

                        {/* ── Progress Stepper ── */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                {isReturn ? 'Return Progress' : 'Shipment Progress'}
                            </h3>
                            <StatusStepper currentStatus={order.status} />
                        </div>

                        {/* ── Escrow + Meta row ── */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Order Placed</p>
                                <p className="text-sm font-medium text-foreground">{orderedAt}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Delivered At</p>
                                <p className="text-sm font-medium text-foreground">{deliveredAt}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground mb-1">Escrow</p>
                                <p className={`text-sm font-mono font-bold ${order.fundsReleased ? 'text-green-400' : 'text-amber-400'}`}>
                                    {formatUnits(order.pricePaid, 18)} ETH
                                    <span className="text-xs font-normal ml-1 opacity-75">
                                        ({order.fundsReleased ? 'Released' : 'Locked'})
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* ── Product Info ── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Product ID</p>
                                <p className="text-sm font-mono font-semibold text-foreground">#{order.productId?.toString()}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-border/60 bg-muted/20">
                                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                                <p className="text-sm font-semibold text-foreground">1 Unit</p>
                            </div>
                        </div>

                        {/* ── Chain of Custody ── */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Chain of Custody</h3>
                            <div className="space-y-2">
                                <ActorBadge label="Consumer" address={order.consumer} color="blue" />
                                <ActorBadge label="Manufacturer" address={order.manufacturer} color="teal" />
                                <ActorBadge label="Raw Material Supplier" address={order.rmsAssigned} color="amber" />
                                <ActorBadge label="Distributor" address={order.distributorAssigned} color="purple" />
                            </div>
                        </div>

                        {/* ── Return Alert ── */}
                        {returnRequest && (
                            <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/25 space-y-3">
                                <div className="flex items-center gap-2 text-red-400 font-semibold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Return Flow Active
                                </div>
                                <div className="text-sm space-y-1 text-foreground">
                                    <p><span className="text-muted-foreground">Reason: </span>{returnRequest.reason}</p>
                                    <p><span className="text-muted-foreground">Description: </span>{returnRequest.description}</p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { label: 'Pending Review', done: true },
                                        { label: 'Approved', done: returnRequest.approved },
                                        { label: 'Picked Up', done: returnRequest.pickedUp },
                                        { label: 'Completed', done: returnRequest.completed },
                                    ].map((s) => (
                                        <span key={s.label} className={`text-xs px-2 py-0.5 rounded-full border ${s.done
                                            ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                            : 'bg-muted/40 border-border text-muted-foreground'
                                            }`}>
                                            {s.done ? '✓ ' : ''}{s.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* ── Footer note ── */}
                <p className="text-center text-xs text-muted-foreground pb-4">
                    This waybill is immutably recorded on the blockchain. Data cannot be altered retroactively.
                </p>
            </div>
        </div>
    );
}
