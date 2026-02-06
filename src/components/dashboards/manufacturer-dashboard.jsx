import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
  const [deliveryDays, setDeliveryDays] = useState('7'); // Default 7 days
  const [selectedRms, setSelectedRms] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState('');
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

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rms_suppliers') || '[]');
      if (Array.isArray(saved)) {
        setSuppliers(saved);
        if (!selectedRms && saved.length > 0) {
          setSelectedRms(saved[0]);
        }
      }
    } catch (_) { }
  }, []);

  // Try to fetch on-chain RMS pool (new contract function). Gracefully ignore if missing.
  const { data: rmsPoolOnChain } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRawMaterialSupplierPool',
    query: {
      enabled: true,
      staleTime: 60_000,
    },
  });

  useEffect(() => {
    if (Array.isArray(rmsPoolOnChain) && rmsPoolOnChain.length > 0) {
      const unique = Array.from(new Set([...
        suppliers,
      ...rmsPoolOnChain,
      ].map((a) => a.toLowerCase())));
      // Preserve original casing from chain where possible
      const merged = unique.map((addrLower) => {
        const fromChain = rmsPoolOnChain.find((a) => a.toLowerCase() === addrLower);
        return fromChain || suppliers.find((a) => a.toLowerCase() === addrLower) || addrLower;
      });
      setSuppliers(merged);
      if (!selectedRms && merged.length > 0) {
        setSelectedRms(merged[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rmsPoolOnChain]);

  useEffect(() => {
    try {
      localStorage.setItem('rms_suppliers', JSON.stringify(suppliers));
    } catch (_) { }
  }, [suppliers]);

  const handleAddSupplier = () => {
    const addr = newSupplier.trim();
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      showError('Invalid address', 'Please enter a valid Ethereum address');
      return;
    }
    if (suppliers.includes(addr)) {
      showError('Already added', 'This supplier is already in the list');
      return;
    }
    const next = [...suppliers, addr];
    setSuppliers(next);
    setSelectedRms(addr);
    setNewSupplier('');
  };

  const handleRemoveSupplier = (addr) => {
    const next = suppliers.filter((a) => a !== addr);
    setSuppliers(next);
    if (selectedRms === addr) {
      setSelectedRms(next[0] || '');
    }
  };

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
      setDeliveryDays('7'); // Reset to default
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

    const days = parseInt(deliveryDays) || 7;
    if (days < 1 || days > 30) {
      showError('Validation Error', 'Delivery days must be between 1 and 30');
      return;
    }

    // Save delivery days to localStorage (will be associated with product name for now)
    // In a real app, this would be stored with the product ID after transaction confirms
    try {
      const deliveryData = JSON.parse(localStorage.getItem('product_delivery_days') || '{}');
      deliveryData[productName.toLowerCase().trim()] = days;
      localStorage.setItem('product_delivery_days', JSON.stringify(deliveryData));
    } catch (_) { }

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
      showError('Validation Error', 'Please select a supplier');
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
    <div className="relative space-y-6 p-6 lg:p-8 bg-background min-h-screen max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Manufacturer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage products, production, and returns.
          </p>
        </div>
      </motion.div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product Name</label>
            <Input
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Image URL</label>
            <Input
              placeholder="https://example.com/image.jpg or ipfs://..."
              value={productImageUri}
              onChange={(e) => setProductImageUri(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter image URL (HTTP/HTTPS, IPFS, or data URI). Leave empty if no image.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input
              placeholder="Enter product description"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price (ETH)</label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.0"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Estimated Delivery (Days)</label>
            <Input
              type="number"
              min="1"
              max="30"
              placeholder="7"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How many days will it take to deliver this product? (1-30 days)
            </p>
          </div>
          <Button
            onClick={handleListProduct}
            disabled={isListing || isListingConfirming || !productName || !productDesc || !productPrice}
          >
            {isListing || isListingConfirming ? 'Listing...' : 'List Product'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Management
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchOrders()}
              className="border-border/60"
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
              <label className="text-sm font-medium text-foreground">Raw Material Supplier</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Select value={selectedRms} onChange={(e) => setSelectedRms(e.target.value)}>
                    {suppliers.length === 0 ? (
                      <option value="" disabled>
                        No suppliers yet — add one below
                      </option>
                    ) : null}
                    {suppliers.map((addr) => (
                      <option key={addr} value={addr}>
                        {addr.slice(0, 6)}…{addr.slice(-4)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add supplier 0x..."
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSupplier} variant="outline" className="shrink-0">
                    Add
                  </Button>
                </div>
              </div>
              {selectedRms && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{selectedRms}</span>
                  <Button onClick={() => handleRemoveSupplier(selectedRms)} size="sm" variant="outline" className="h-7 px-2">
                    Remove
                  </Button>
                </div>
              )}
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
              <div className="text-center text-muted-foreground py-4">
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

