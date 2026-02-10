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
import { DeliveryConfirmationModal } from '@/components/delivery-confirmation-modal';
import { showLoading, showSuccess, showError, closeAlert } from '@/lib/sweetalert';
import { ProductCard3D, AnimatedCart } from '@/components/3d-elements';
import { getOrderStatusText } from '@/utils/tracking-mapper';

export function ConsumerDashboard() {
  const { address } = useAccount();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnRequestOrder, setReturnRequestOrder] = useState(null);
  const [pendingOrderProduct, setPendingOrderProduct] = useState(null); // Product awaiting delivery confirmation
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

  // Show delivery confirmation modal before placing order
  const handleShowDeliveryConfirmation = (product) => {
    setPendingOrderProduct(product);
  };

  // Actually place the order after user confirms delivery time
  const handleConfirmOrder = () => {
    if (!pendingOrderProduct) return;

    const { productId, price, name } = pendingOrderProduct;
    showLoading(`Placing order for ${name}...`, 'Please confirm the transaction in your wallet');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'placeOrder',
      args: [BigInt(productId)],
      value: BigInt(price),
    });
    setPendingOrderProduct(null);
  };

  // Cancel the pending order
  const handleCancelOrder = () => {
    setPendingOrderProduct(null);
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
    <div className="relative space-y-8 p-6 lg:p-8 bg-background min-h-screen max-w-6xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex items-center justify-between gap-4 mb-6"
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Marketplace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse products and track your orders.
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center h-10 w-10 rounded-lg bg-muted">
          <AnimatedCart size={20} />
        </div>
      </motion.div>

      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="text-lg font-semibold mb-4 text-foreground"
        >
          Featured products
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
                  <Card className="overflow-hidden group cursor-pointer h-full flex flex-col border border-border/60 bg-card/60">
                    {/* Product Media: 1:1 */}
                    <div className="relative w-full aspect-square overflow-hidden">
                      {product.imageUri && product.imageUri.trim() !== '' ? (
                        <img
                          src={product.imageUri}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 hidden items-center justify-center bg-muted/20 text-muted-foreground group-[&>img[style*='display: none']]:flex">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-background/70 via-background/20 to-transparent flex items-end p-3">
                        <div className="ml-auto">
                          <Button
                            size="sm"
                            onClick={() => handleShowDeliveryConfirmation(product)}
                            disabled={isPending || isConfirming}
                            className="rounded-full h-9 px-4 bg-primary hover:bg-secondary text-primary-foreground"
                          >
                            {isPending || isConfirming ? 'Processing…' : 'Buy Now'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardHeader className="border-b border-border/60 p-3 flex-shrink-0 bg-background/20">
                      <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                        {product.name}
                      </CardTitle>
                      {/* Stock Status Badge */}
                      <div className="mt-1">
                        {product.stock && Number(product.stock) > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {product.stock.toString()} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Made to Order
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 bg-background/10 flex-grow flex flex-col">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-shrink-0" style={{ minHeight: '40px' }}>{product.description}</p>
                      <div className="flex items-end justify-between pt-4 border-t border-border/60 mt-auto">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Price</div>
                          <span className="text-2xl font-semibold text-price">
                            {formatUnits(product.price, 18)} ETH
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ProductCard3D>
            ))}
          </div>
        ) : (
          <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/30 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-muted-foreground text-lg">No products available in the marketplace.</p>
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
        <h2 className="text-2xl font-semibold mb-4 text-foreground">My Orders</h2>
        {orders.length > 0 ? (
          <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
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

      {pendingOrderProduct && (
        <DeliveryConfirmationModal
          product={pendingOrderProduct}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
          isPending={isPending || isConfirming}
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



  // ... (inside OrderRow)
  if (!order) return null;

  const statusText = getOrderStatusText(order.status);

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
          <span className="text-sm font-medium">{statusText}</span>
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

