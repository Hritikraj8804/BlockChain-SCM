import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatUnits } from 'viem';
import { AIOrderSummary } from '@/components/ai-order-summary';
import { ReturnRequestModal } from '@/components/return-request-modal';
import { showLoading, showSuccess, showError, closeAlert } from '@/lib/sweetalert';
import { ProductCard3D, MetaverseParticles, AnimatedCart, BlockchainNode } from '@/components/3d-elements';

export function ConsumerDashboard() {
  const { address } = useAccount();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnRequestOrder, setReturnRequestOrder] = useState(null);
  const queryClient = useQueryClient();

  // Get active products
  const { data: products, refetch: refetchProducts } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveProducts',
  });

  // Get consumer orders
  const { data: orderIds, refetch: refetchOrders } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActorOrders',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Fetch order details
  const orders = orderIds?.map((id) => {
    // In a real app, you'd fetch each order individually
    // For now, we'll use a simplified approach
    return { bookingId: id };
  }) || [];

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
  });

  const { writeContract: writeRequestReturn, data: returnHash, isPending: isReturnPending, error: returnError } = useWriteContract();
  const { isLoading: isReturnConfirming, isSuccess: isReturnSuccess, isError: isReturnTxError } = useWaitForTransactionReceipt({
    hash: returnHash,
  });

  // SweetAlert notifications
  useEffect(() => {
    if (isPending) {
      showLoading('Placing order...', 'Please wait while we process your order');
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      showLoading('Waiting for confirmation...', 'Transaction is being confirmed on blockchain');
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      closeAlert();
      showSuccess('Order placed successfully!', 'Your order has been placed and is being processed');
      // Invalidate and refetch queries
      queryClient.invalidateQueries();
      refetchProducts();
      refetchOrders();
      console.log(orders);
    }
  }, [isSuccess, queryClient, refetchProducts, refetchOrders]);

  useEffect(() => {
    if (writeError || isTxError) {
      closeAlert();
      showError('Failed to place order', writeError?.message || 'Transaction failed. Please try again.');
    }
  }, [writeError, isTxError]);

  // SweetAlert notifications for return request
  useEffect(() => {
    if (isReturnPending) showLoading('Requesting return...', 'Processing your return request');
  }, [isReturnPending]);
  useEffect(() => {
    if (isReturnConfirming) showLoading('Waiting for confirmation...', 'Return request is being confirmed');
  }, [isReturnConfirming]);
  useEffect(() => {
    if (isReturnSuccess) {
      closeAlert();
      showSuccess('Return requested successfully!', 'Your return request has been submitted');
      setReturnRequestOrder(null);
      queryClient.invalidateQueries();
      refetchOrders();
    }
  }, [isReturnSuccess, queryClient, refetchOrders]);
  useEffect(() => {
    if (returnError || isReturnTxError) {
      closeAlert();
      showError('Failed to request return', returnError?.message || 'Please try again');
    }
  }, [returnError, isReturnTxError]);

  const handlePlaceOrder = (productId, price, productName) => {
    showLoading(`Placing order for ${productName}...`, 'Please confirm the transaction in your wallet');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'placeOrder',
      args: [BigInt(productId)],
      value: BigInt(price),
    });
  };

  const handleRequestReturn = (bookingId, reason, description) => {
    showLoading(`Submitting return request for order #${bookingId}...`, 'Processing your return request');
    writeRequestReturn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'requestReturn',
      args: [BigInt(bookingId), reason, description],
    });
  };

  return (
    <div className="relative space-y-8 p-8 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30 min-h-screen overflow-hidden">
      {/* Metaverse Background Elements */}
      <MetaverseParticles count={20} />
      <BlockchainNode delay={0} position={{ x: 5, y: 10 }} color="#3B82F6" />
      <BlockchainNode delay={0.5} position={{ x: 95, y: 15 }} color="#8B5CF6" />
      <BlockchainNode delay={1} position={{ x: 50, y: 5 }} color="#10B981" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center gap-4 mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl"
        >
          <AnimatedCart size={32} />
        </motion.div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🛍️ Ecommerce Marketplace
          </h1>
          <p className="text-gray-300 mt-2 text-lg font-medium">Browse amazing products & track your orders</p>
        </div>
      </motion.div>

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-8 text-blue-300 flex items-center gap-3"
        >
          <span className="text-4xl">🛒</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Featured Products
          </span>
        </motion.h2>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard3D key={product.productId.toString()}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-2xl border-2 border-blue-500/30 bg-gradient-to-br from-slate-800/90 via-slate-700/50 to-slate-800/90 backdrop-blur-sm overflow-hidden group cursor-pointer h-full flex flex-col">
                    {/* Product Image with 3D Effect */}
                    {product.imageUri && product.imageUri.trim() !== '' ? (
                      <div className="relative w-full h-40 flex-shrink-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={product.imageUri}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 flex-shrink-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative">
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <svg className="w-20 h-20 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </motion.div>
                      </div>
                    )}
                    <CardHeader className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border-b border-blue-500/20 p-3 flex-shrink-0">
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent line-clamp-1">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 bg-slate-800/30 flex-grow flex flex-col">
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 flex-shrink-0" style={{ minHeight: '40px' }}>{product.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t-2 border-blue-500/20 mt-auto">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Price</div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {formatUnits(product.price, 18)} ETH
                          </span>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => handlePlaceOrder(product.productId, product.price, product.name)}
                            disabled={isPending || isConfirming}
                            className="shadow-xl hover:shadow-2xl gradient-primary text-white font-bold px-4 py-2 rounded-xl"
                          >
                            {isPending || isConfirming ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                                Processing...
                              </>
                            ) : (
                              <>
                                🛒 Buy Now
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ProductCard3D>
            ))}
          </div>
        ) : (
          <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-300 text-lg">No products available in the marketplace.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10"
      >
        <h2 className="text-3xl font-bold mb-8 text-blue-300 flex items-center gap-3">
          <span className="text-4xl">📦</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            My Orders
          </span>
        </h2>
        {orders.length > 0 ? (
          <Card className="shadow-glow border-blue-500/20 bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <OrderRow
                      key={order.bookingId.toString()}
                      bookingId={order.bookingId}
                      selectedOrder={selectedOrder}
                      setSelectedOrder={setSelectedOrder}
                      onRequestReturn={() => setReturnRequestOrder(order.bookingId)}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-400 py-8">
            You haven't placed any orders yet.
          </div>
        )}
      </motion.div>

      {selectedOrder && (
        <AIOrderSummary bookingId={selectedOrder} />
      )}

      {returnRequestOrder && (
        <ReturnRequestModal
          bookingId={returnRequestOrder}
          onRequestReturn={handleRequestReturn}
          onClose={() => setReturnRequestOrder(null)}
          isPending={isReturnPending || isReturnConfirming}
        />
      )}
    </div>
  );
}

function OrderRow({ bookingId, selectedOrder, setSelectedOrder, onRequestReturn }) {
  const { data: order } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: [BigInt(bookingId)],
  });

  const { data: isEligible } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isReturnEligible',
    args: [BigInt(bookingId)],
    query: {
      enabled: !!order && order.status === 6, // Only check if delivered
    },
  });

  const { data: remainingTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRemainingReturnTime',
    args: [BigInt(bookingId)],
    query: {
      enabled: !!order && order.status === 6,
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

  const formatTime = (seconds) => {
    if (!seconds || Number(seconds) === 0) return 'Expired';
    const days = Math.floor(Number(seconds) / 86400);
    const hours = Math.floor((Number(seconds) % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <TableRow>
      <TableCell className="font-mono">#{bookingId.toString()}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{statusMap[order.status] || 'Unknown'}</span>
          {order.status === 6 && remainingTime && (
            <span className="text-xs text-gray-400">
              Return window: {formatTime(remainingTime)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedOrder(selectedOrder === bookingId ? null : bookingId)}
            className="shadow-sm hover:shadow-md"
          >
            {selectedOrder === bookingId ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Track
              </>
            )}
          </Button>
          {order.status === 6 && isEligible && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRequestReturn}
              className="border-red-400 text-red-300 hover:bg-red-500/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Return
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

