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
    <div className="relative space-y-8 p-8 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 min-h-screen overflow-hidden">
      <MetaverseParticles count={15} />
      <BlockchainNode delay={0} position={{ x: 10, y: 10 }} color="#3B82F6" />
      <BlockchainNode delay={0.5} position={{ x: 90, y: 15 }} color="#10B981" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-4 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl"
        >
          <span className="text-3xl">📦</span>
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Raw Material Supplier
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">Manage material requests and dispatch</p>
        </div>
      </motion.div>

      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
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
            <div className="text-center text-gray-400 py-8">
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

  const statusMap = {
    0: 'Pending',
    1: 'Materials Requested',
    2: 'Materials Dispatched',
    3: 'In Production',
    4: 'Ready For Shipping',
    5: 'In Transit',
    6: 'Delivered',
  };

  const canDispatch = order.status === 1 && order.rmsAssigned?.toLowerCase() === rmsAddress?.toLowerCase();

  return (
    <TableRow>
      <TableCell className="font-mono">#{bookingId.toString()}</TableCell>
      <TableCell>
        <span className="text-sm">{statusMap[order.status] || 'Unknown'}</span>
      </TableCell>
      <TableCell>
        {canDispatch ? (
          <Button
            size="sm"
            onClick={() => onDispatchMaterials(bookingId)}
            disabled={isDispatching}
          >
            {isDispatching ? 'Dispatching...' : 'Dispatch Materials'}
          </Button>
        ) : (
          <span className="text-xs text-gray-400">No action available</span>
        )}
      </TableCell>
    </TableRow>
  );
}

