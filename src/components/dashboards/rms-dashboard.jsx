import { useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showLoading, showSuccess, showError, closeAlert } from '@/lib/sweetalert';
import { MetaverseParticles, BlockchainNode } from '@/components/3d-elements';
import { getOrderStatusText } from '@/utils/tracking-mapper';

export function RMSDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Get RMS orders
  const { data: orderIds, refetch: refetchOrders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActorOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const orders = orderIds || [];

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
  });

  // SweetAlert notifications
  useEffect(() => {
    if (isPending) showLoading('Dispatching materials...', 'Sending materials to manufacturer');
  }, [isPending]);
  useEffect(() => {
    if (isConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isConfirming]);
  useEffect(() => {
    if (isSuccess) {
      closeAlert();
      showSuccess('Dispatched materials successfully!', 'Materials have been dispatched to manufacturer');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (writeError || isTxError) {
      closeAlert();
      showError('Failed to dispatch materials', writeError?.message || 'Please try again');
    }
  }, [writeError, isTxError]);

  const handleDispatchMaterials = (bookingId) => {
    showLoading(`Dispatching materials for order #${bookingId}...`, 'Processing dispatch');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'dispatchMaterials',
      args: [BigInt(bookingId)],
    });
  };

  return (
    <div className="relative space-y-6 p-6 lg:p-8 bg-background min-h-screen max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Raw Materials
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review material requests and dispatch shipments.
          </p>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Material Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((orderId) => (
                  <OrderRow
                    key={orderId.toString()}
                    bookingId={orderId}
                    rmsAddress={address}
                    onDispatchMaterials={handleDispatchMaterials}
                    isDispatching={isPending || isConfirming}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No material requests assigned to you yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({ bookingId, rmsAddress, onDispatchMaterials, isDispatching }) {
  const { data: order } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: [BigInt(bookingId)],
  });

  if (!order) return null;

  const statusNum = Number(order.status);
  const statusText = getOrderStatusText(order.status);
  const statusChipClass = (
    statusNum === 2 ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' :
      statusNum === 1 ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse' :
        'bg-muted/40 border-border text-muted-foreground'
  );
  const statusDotClass = statusNum === 1 ? 'bg-amber-400 animate-pulse' : statusNum === 2 ? 'bg-teal-400' : 'bg-muted-foreground';

  const canDispatch = order.status === 1 && order.rmsAssigned?.toLowerCase() === rmsAddress?.toLowerCase();

  return (
    <TableRow className="hover:bg-muted/20 transition-colors">
      <TableCell className="font-mono text-muted-foreground text-xs">#{bookingId.toString()}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusChipClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
          {statusText}
        </span>
      </TableCell>
      <TableCell>
        {canDispatch ? (
          <Button
            size="sm"
            onClick={() => onDispatchMaterials(bookingId)}
            disabled={isDispatching}
            className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
            {isDispatching ? 'Dispatching...' : 'Dispatch Materials'}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">Awaiting request</span>
        )}
      </TableCell>
    </TableRow>
  );
}

