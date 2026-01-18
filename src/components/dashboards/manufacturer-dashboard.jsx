import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUnits } from 'viem';
import { showLoading, showSuccess, showError, closeAlert } from '@/lib/sweetalert';
import { MetaverseParticles, BlockchainNode } from '@/components/3d-elements';

export function ManufacturerDashboard() {
  const { address } = useAccount();
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productImageUri, setProductImageUri] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [selectedRms, setSelectedRms] = useState('');
  const queryClient = useQueryClient();

  // Get manufacturer orders (with auto-refresh for real-time updates)
  const { data: orderIds, refetch: refetchOrders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActorOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Poll every 5 seconds for new orders
    },
  });

  // Debug: Log order data to console
  console.log('Manufacturer Dashboard - Address:', address);
  console.log('Manufacturer Dashboard - Order IDs:', orderIds);

  // Fetch order details (simplified - in production, fetch each individually)
  const orders = orderIds || [];

  const { writeContract: writeListProduct, data: listHash, isPending: isListing, error: listError } = useWriteContract();
  const { isLoading: isListingConfirming, isSuccess: isListSuccess, isError: isListTxError } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  const { writeContract: writeRequestMaterials, data: requestHash, isPending: isRequesting, error: requestError } = useWriteContract();
  const { isLoading: isRequestConfirming, isSuccess: isRequestSuccess, isError: isRequestTxError } = useWaitForTransactionReceipt({
    hash: requestHash,
  });

  const { writeContract: writeCompleteProduction, data: completeHash, isPending: isCompleting, error: completeError } = useWriteContract();
  const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess, isError: isCompleteTxError } = useWaitForTransactionReceipt({
    hash: completeHash,
  });

  const { writeContract: writeApproveReturn, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess, isError: isApproveTxError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { writeContract: writeRejectReturn, data: rejectHash, isPending: isRejecting, error: rejectError } = useWriteContract();
  const { isLoading: isRejectConfirming, isSuccess: isRejectSuccess, isError: isRejectTxError } = useWaitForTransactionReceipt({
    hash: rejectHash,
  });

  const { writeContract: writeConfirmReturn, data: confirmReturnHash, isPending: isConfirmingReturn, error: confirmReturnError } = useWriteContract();
  const { isLoading: isConfirmReturnConfirming, isSuccess: isConfirmReturnSuccess, isError: isConfirmReturnTxError } = useWaitForTransactionReceipt({
    hash: confirmReturnHash,
  });

  // SweetAlert notifications for list product
  useEffect(() => {
    if (isListing) showLoading('Listing product...', 'Adding your product to the marketplace');
  }, [isListing]);
  useEffect(() => {
    if (isListingConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isListingConfirming]);
  useEffect(() => {
    if (isListSuccess) {
      closeAlert();
      showSuccess('Product listed successfully!', 'Your product is now available in the marketplace');
      setProductName('');
      setProductDesc('');
      setProductImageUri('');
      setProductPrice('');
      queryClient.invalidateQueries();
    }
  }, [isListSuccess, queryClient]);
  useEffect(() => {
    if (listError || isListTxError) {
      closeAlert();
      showError('Failed to list product', listError?.message || 'Please try again');
    }
  }, [listError, isListTxError]);

  // SweetAlert notifications for request materials
  useEffect(() => {
    if (isRequesting) showLoading('Requesting materials...', 'Sending material request to supplier');
  }, [isRequesting]);
  useEffect(() => {
    if (isRequestConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isRequestConfirming]);
  useEffect(() => {
    if (isRequestSuccess) {
      closeAlert();
      showSuccess('Requested for materials successfully!', 'Material request has been sent');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isRequestSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (requestError || isRequestTxError) {
      closeAlert();
      showError('Failed to request materials', requestError?.message || 'Please try again');
    }
  }, [requestError, isRequestTxError]);

  // SweetAlert notifications for complete production
  useEffect(() => {
    if (isCompleting) showLoading('Completing production...', 'Marking production as complete');
  }, [isCompleting]);
  useEffect(() => {
    if (isCompleteConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isCompleteConfirming]);
  useEffect(() => {
    if (isCompleteSuccess) {
      closeAlert();
      showSuccess('Production completed!', 'Distributor assigned for delivery');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isCompleteSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (completeError || isCompleteTxError) {
      closeAlert();
      showError('Failed to complete production', completeError?.message || 'Please try again');
    }
  }, [completeError, isCompleteTxError]);

  // SweetAlert notifications for approve return
  useEffect(() => {
    if (isApproving) showLoading('Approving return...', 'Processing return approval and refund deposit');
  }, [isApproving]);
  useEffect(() => {
    if (isApproveConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isApproveConfirming]);
  useEffect(() => {
    if (isApproveSuccess) {
      closeAlert();
      showSuccess('Return accepted!', 'Refund deposited and distributor assigned for pickup');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isApproveSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (approveError || isApproveTxError) {
      closeAlert();
      showError('Failed to approve return', approveError?.message || 'Please try again');
    }
  }, [approveError, isApproveTxError]);

  // SweetAlert notifications for reject return
  useEffect(() => {
    if (isRejecting) showLoading('Rejecting return...', 'Processing return rejection');
  }, [isRejecting]);
  useEffect(() => {
    if (isRejectConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isRejectConfirming]);
  useEffect(() => {
    if (isRejectSuccess) {
      closeAlert();
      showSuccess('Return deleted/rejected successfully.', 'Return request has been rejected');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isRejectSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (rejectError || isRejectTxError) {
      closeAlert();
      showError('Failed to reject return', rejectError?.message || 'Please try again');
    }
  }, [rejectError, isRejectTxError]);

  // SweetAlert notifications for confirm return received
  useEffect(() => {
    if (isConfirmingReturn) showLoading('Confirming return received...', 'Processing return confirmation');
  }, [isConfirmingReturn]);
  useEffect(() => {
    if (isConfirmReturnConfirming) showLoading('Waiting for confirmation...', 'Transaction is being confirmed');
  }, [isConfirmReturnConfirming]);
  useEffect(() => {
    if (isConfirmReturnSuccess) {
      closeAlert();
      showSuccess('Confirm return received!', 'Return process completed successfully');
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isConfirmReturnSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (confirmReturnError || isConfirmReturnTxError) {
      closeAlert();
      showError('Failed to confirm return', confirmReturnError?.message || 'Please try again');
    }
  }, [confirmReturnError, isConfirmReturnTxError]);

  const handleListProduct = () => {
    if (!productName || !productDesc || !productPrice) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    const priceInWei = BigInt(Math.floor(parseFloat(productPrice) * 1e18));
    const imageUri = productImageUri.trim() || ''; // Allow empty image URI
    showLoading(`Listing ${productName}...`, 'Adding product to marketplace');

    writeListProduct({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'listProduct',
      args: [productName, imageUri, productDesc, priceInWei],
    });
  };

  const handleRequestMaterials = (bookingId) => {
    if (!selectedRms) {
      showError('Validation Error', 'Please enter RMS address');
      return;
    }

    showLoading(`Requesting materials for order #${bookingId}...`, 'Sending request to supplier');

    writeRequestMaterials({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'requestMaterials',
      args: [BigInt(bookingId), selectedRms],
    });
  };

  const handleCompleteProduction = (bookingId) => {
    showLoading(`Completing production for order #${bookingId}...`, 'Marking production as complete');

    writeCompleteProduction({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'completeProduction',
      args: [BigInt(bookingId)],
    });
  };

  const handleApproveReturn = (returnId, pricePaid) => {

    showLoading(`Approving return #${returnId}...`, 'Processing return approval and refund deposit');
    writeApproveReturn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'approveReturn',
      args: [BigInt(returnId)],
      value: BigInt(pricePaid),
    });

  };

  const handleRejectReturn = (returnId, rejectionReason) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      showError('Validation Error', 'Please provide a rejection reason');
      return;
    }
    showLoading(`Rejecting return #${returnId}...`, 'Processing return rejection');
    writeRejectReturn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'rejectReturn',
      args: [BigInt(returnId), rejectionReason],
    });
  };

  const handleConfirmReturnReceived = (returnId) => {
    showLoading(`Confirming return received #${returnId}...`, 'Processing return confirmation');
    writeConfirmReturn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'confirmReturnReceived',
      args: [BigInt(returnId)],
    });
  };

  return (
    <div className="relative space-y-8 p-8 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 min-h-screen overflow-hidden">
      <MetaverseParticles count={15} />
      <BlockchainNode delay={0} position={{ x: 5, y: 10 }} color="#3B82F6" />
      <BlockchainNode delay={0.5} position={{ x: 95, y: 15 }} color="#8B5CF6" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-4 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl"
        >
          <span className="text-3xl">🏭</span>
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Manufacturer Dashboard
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">Manage products and production orders</p>
        </div>
      </motion.div>

      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
          <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Product Name</label>
            <Input
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Image URI</label>
            <Input
              placeholder="https://example.com/image.jpg or ipfs://..."
              value={productImageUri}
              onChange={(e) => setProductImageUri(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              Enter image URL (HTTP/HTTPS, IPFS, or data URI). Leave empty if no image.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <Input
              placeholder="Enter product description"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Price (ETH)</label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.0"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <Button
            onClick={handleListProduct}
            disabled={isListing || isListingConfirming || !productName || !productDesc || !productPrice}
          >
            {isListing || isListingConfirming ? 'Listing...' : 'List Product'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-blue-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Management
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchOrders()}
              className="border-green-400 text-green-300 hover:bg-green-500/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">RMS Address (for material requests)</label>
              <Input
                placeholder="0x..."
                value={selectedRms}
                onChange={(e) => setSelectedRms(e.target.value)}
              />
            </div>

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
                      onRequestMaterials={handleRequestMaterials}
                      onCompleteProduction={handleCompleteProduction}
                      onApproveReturn={handleApproveReturn}
                      onRejectReturn={handleRejectReturn}
                      onConfirmReturnReceived={handleConfirmReturnReceived}
                      selectedRms={selectedRms}
                      isRequesting={isRequesting || isRequestConfirming}
                      isCompleting={isCompleting || isCompleteConfirming}
                      isApproving={isApproving || isApproveConfirming}
                      isRejecting={isRejecting || isRejectConfirming}
                      isConfirmingReturn={isConfirmingReturn || isConfirmReturnConfirming}
                    />
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-400 py-4">
                No orders assigned to you yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({
  bookingId,
  onRequestMaterials,
  onCompleteProduction,
  onApproveReturn,
  onRejectReturn,
  onConfirmReturnReceived,
  selectedRms,
  isRequesting,
  isCompleting,
  isApproving,
  isRejecting,
  isConfirmingReturn,
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: order } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: [BigInt(bookingId)],
  });

  const { data: returnRequest, isError: returnError, error: returnFetchError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReturnByBookingId',
    args: [BigInt(bookingId)],
    query: {
      enabled: !!order && (order.status === 7 || order.status === 8 || order.status === 9),
      refetchInterval: 5000, // Poll for return request updates
    },
  });

  // Debug: Log order status and return request
  console.log(`Order #${bookingId} - Status: ${order?.status}, Return Request:`, returnRequest, 'Error:', returnError, returnFetchError);

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

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showError('Validation Error', 'Please provide a rejection reason');
      return;
    }
    if (returnRequest) {
      onRejectReturn(returnRequest.returnId, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-mono">#{bookingId.toString()}</TableCell>
        <TableCell>
          <span className="text-sm">{statusMap[order.status] || 'Unknown'}</span>
        </TableCell>
        <TableCell>
          <div className="flex gap-2 flex-wrap">
            {order.status === 0 && (
              <Button
                size="sm"
                onClick={() => onRequestMaterials(bookingId)}
                disabled={isRequesting || !selectedRms}
              >
                Request Materials
              </Button>
            )}
            {order.status === 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompleteProduction(bookingId)}
                disabled={isCompleting}
              >
                Complete Production
              </Button>
            )}
            {order.status === 7 && returnRequest && !returnRequest.approved && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApproveReturn(returnRequest.returnId, order.pricePaid)}
                  disabled={isApproving}
                  className="border-green-400 text-green-300 hover:bg-green-500/20"
                >
                  Approve Return
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="border-red-400 text-red-300 hover:bg-red-500/20"
                >
                  Reject Return
                </Button>
              </>
            )}
            {order.status === 8 && returnRequest && returnRequest.approved && returnRequest.pickedUp && !returnRequest.completed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onConfirmReturnReceived(returnRequest.returnId)}
                disabled={isConfirmingReturn}
                className="border-blue-400 text-blue-300 hover:bg-blue-500/20"
              >
                Confirm Return Received
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl bg-slate-800 border-red-500/30">
            <CardHeader className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-b border-red-500/20">
              <CardTitle className="text-xl font-bold text-red-300">Reject Return Request</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-slate-800">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Rejection Reason</label>
                <Input
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRejecting ? 'Rejecting...' : 'Reject Return'}
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  disabled={isRejecting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

