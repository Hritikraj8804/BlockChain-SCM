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

export function DistributorDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [processingReturnId, setProcessingReturnId] = useState(null);

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
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (writeError || isTxError) {
      closeAlert();
      showError('Failed to confirm delivery', writeError?.message || 'Please try again');
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
    <div className="relative space-y-8 p-8 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 min-h-screen overflow-hidden">
      <MetaverseParticles count={15} />
      <BlockchainNode delay={0} position={{ x: 5, y: 10 }} color="#3B82F6" />
      <BlockchainNode delay={0.5} position={{ x: 95, y: 15 }} color="#10B981" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-4 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl"
        >
          <span className="text-3xl">🚚</span>
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Distributor Dashboard
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">Manage delivery tasks and confirmations</p>
        </div>
      </motion.div>

      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
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
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No delivery tasks assigned to you yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({ bookingId, distributorAddress, onConfirmDelivery, onConfirmReturnPickup, isConfirming, isPickupConfirming, processingReturnId }) {
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

  const statusMap = {
    0: 'Pending',
    1: 'Materials Requested',
    2: 'Materials Dispatched',
    3: 'In Production',
    4: 'Ready For Shipping',
    5: 'In Transit',
    6: 'Delivered',
    7: 'Return Requested',
    8: 'Return In Transit',
    9: 'Return Received',
    10: 'Refunded',
  };

  // Check if assigned for delivery or return pickup
  const isAssignedForDelivery = order.distributorAssigned?.toLowerCase() === distributorAddress?.toLowerCase();
  const isAssignedForReturn = returnRequest && returnRequest.returnDistributor?.toLowerCase() === distributorAddress?.toLowerCase();
  const canDeliver = isAssignedForDelivery && order.status === 5;
  const canPickupReturn = isAssignedForReturn && order.status === 8 && returnRequest.approved && !returnRequest.pickedUp;

  // Check if this specific return is being processed
  const isThisReturnProcessing = returnRequest && processingReturnId && returnRequest.returnId.toString() === processingReturnId.toString();

  if (!isAssignedForDelivery && !isAssignedForReturn) return null;

  return (
    <TableRow>
      <TableCell className="font-mono">#{bookingId.toString()}</TableCell>
      <TableCell>
        <span className="text-sm">{statusMap[order.status] || 'Unknown'}</span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {canDeliver && (
            <Button
              size="sm"
              onClick={() => onConfirmDelivery(bookingId)}
              disabled={isConfirming}
            >
              {isConfirming ? 'Confirming...' : 'Confirm Delivery'}
            </Button>
          )}
          {canPickupReturn && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfirmReturnPickup(returnRequest.returnId)}
              disabled={isPickupConfirming && isThisReturnProcessing}
              className="border-orange-400 text-orange-300 hover:bg-orange-500/20"
            >
              {(isPickupConfirming && isThisReturnProcessing) ? 'Confirming...' : 'Confirm Return Pickup'}
            </Button>
          )}
          {!canDeliver && !canPickupReturn && (
            <span className="text-xs text-gray-400">No action available</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

