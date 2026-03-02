import { useEffect, useState } from 'react';
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

export function DistributorDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [processingReturnId, setProcessingReturnId] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Get distributor orders (only those assigned to this distributor)
  const { data: orderIds, refetch: refetchOrders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActorOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Filter orders where distributorAssigned == address
  const { data: allOrders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'orderCounter',
  });

  // Deduplicate orders (same order can appear for delivery and return)
  const orders = orderIds ? [...new Set(orderIds.map(id => id.toString()))].map(id => BigInt(id)) : [];

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
  });

  const { writeContract: writeConfirmPickup, data: pickupHash, isPending: isPickupPending, error: pickupError } = useWriteContract();
  const { isLoading: isPickupConfirming, isSuccess: isPickupSuccess, isError: isPickupTxError } = useWaitForTransactionReceipt({
    hash: pickupHash,
  });

  // SweetAlert notifications
  useEffect(() => {
    if (isPending) showLoading('Confirming delivery...', 'Processing delivery confirmation');
  }, [isPending]);
  useEffect(() => {
    if (isConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isConfirming]);
  useEffect(() => {
    if (isSuccess) {
      closeAlert();
      showSuccess('Delivered product successfully!', 'Product has been delivered to consumer');
      setProcessingOrderId(null);
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (writeError || isTxError) {
      closeAlert();
      showError('Failed to confirm delivery', writeError?.message || 'Please try again');
      setProcessingOrderId(null);
    }
  }, [writeError, isTxError]);

  // SweetAlert notifications for return pickup
  useEffect(() => {
    if (isPickupPending) showLoading('Confirming return pickup...', 'Processing return pickup');
  }, [isPickupPending]);
  useEffect(() => {
    if (isPickupConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isPickupConfirming]);
  useEffect(() => {
    if (isPickupSuccess) {
      closeAlert();
      showSuccess('Confirm return pickup!', 'Refund processed to consumer');
      setProcessingReturnId(null);
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isPickupSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (pickupError || isPickupTxError) {
      closeAlert();
      showError('Failed to confirm pickup', pickupError?.message || 'Please try again');
      setProcessingReturnId(null);
    }
  }, [pickupError, isPickupTxError]);

  const handleConfirmDelivery = (bookingId) => {
    setProcessingOrderId(bookingId);
    showLoading(`Confirming delivery for order #${bookingId}...`, 'Processing delivery confirmation');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'confirmDelivery',
      args: [BigInt(bookingId)],
    });
  };

  const handleConfirmReturnPickup = (returnId) => {
    setProcessingReturnId(returnId);
    showLoading(`Confirming return pickup #${returnId}...`, 'Processing return pickup');
    writeConfirmPickup({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'confirmReturnPickup',
      args: [BigInt(returnId)],
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
            Logistics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage assigned deliveries and return pickups.
          </p>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Delivery Tasks
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
                    distributorAddress={address}
                    onConfirmDelivery={handleConfirmDelivery}
                    onConfirmReturnPickup={handleConfirmReturnPickup}
                    isConfirming={isPending || isConfirming}
                    isPickupConfirming={isPickupPending || isPickupConfirming}
                    processingReturnId={processingReturnId}
                    processingOrderId={processingOrderId}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No delivery tasks assigned to you yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({ bookingId, distributorAddress, onConfirmDelivery, onConfirmReturnPickup, isConfirming, isPickupConfirming, processingReturnId, processingOrderId }) {
  const { data: order } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: [BigInt(bookingId)],
  });

  const { data: returnRequest } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReturnByBookingId',
    args: [BigInt(bookingId)],
    query: {
      enabled: !!order && (order.status === 7 || order.status === 8 || order.status === 9),
    },
  });

  if (!order) return null;



  // ... (inside OrderRow component)
  if (!order) return null;

  // Status chip
  const statusNum = Number(order.status);
  const statusText = getOrderStatusText(order.status);
  const statusChipClass = (
    statusNum === 6 ? 'bg-green-500/15 border-green-500/30 text-green-400' :
      statusNum >= 7 ? 'bg-red-500/15 border-red-500/30 text-red-400' :
        statusNum === 5 ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' :
          statusNum === 4 ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' :
            'bg-amber-500/15 border-amber-500/30 text-amber-400'
  );
  const statusDotClass = (
    statusNum === 6 ? 'bg-green-400' :
      statusNum >= 7 ? 'bg-red-400' :
        statusNum === 5 ? 'bg-blue-400' :
          statusNum === 4 ? 'bg-indigo-400' :
            'bg-amber-400'
  );


  // Check if assigned for delivery or return pickup
  const isAssignedForDelivery = order.distributorAssigned?.toLowerCase() === distributorAddress?.toLowerCase();
  const isAssignedForReturn = returnRequest && returnRequest.returnDistributor?.toLowerCase() === distributorAddress?.toLowerCase();
  const canDeliver = isAssignedForDelivery && order.status === 5;
  const canPickupReturn = isAssignedForReturn && order.status === 8 && returnRequest.approved && !returnRequest.pickedUp;

  // Check if this specific return is being processed
  const isThisReturnProcessing = returnRequest && processingReturnId && returnRequest.returnId.toString() === processingReturnId.toString();
  // Check if this specific order is being processed for delivery
  const isThisOrderProcessing = processingOrderId && bookingId.toString() === processingOrderId.toString();

  if (!isAssignedForDelivery && !isAssignedForReturn) return null;

  return (
    <TableRow className="hover:bg-muted/20 transition-colors">
      <TableCell className="font-mono text-muted-foreground text-xs">#{bookingId.toString()}</TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusChipClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass} ${statusNum < 6 ? 'animate-pulse' : ''}`} />
          {statusText}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {canDeliver && (
            <Button
              size="sm"
              onClick={() => onConfirmDelivery(bookingId)}
              disabled={isThisOrderProcessing}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {isThisOrderProcessing ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          )}
          {canPickupReturn && (
            <Button
              size="sm"
              onClick={() => onConfirmReturnPickup(returnRequest.returnId)}
              disabled={isPickupConfirming && isThisReturnProcessing}
              className="gap-1.5 border-orange-400 text-orange-300 hover:bg-orange-500/20"
              variant="outline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              {(isPickupConfirming && isThisReturnProcessing) ? 'Confirming...' : 'Confirm Return Pickup'}
            </Button>
          )}
          {!canDeliver && !canPickupReturn && (
            <span className="text-xs text-muted-foreground italic">Awaiting next step</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

