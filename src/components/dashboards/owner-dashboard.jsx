import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AIOrderSummary } from '@/components/ai-order-summary';

export function OwnerDashboard() {
  const [actorAddress, setActorAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('0');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnWindowDays, setReturnWindowDays] = useState('');
  const queryClient = useQueryClient();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash,
  });

  // Get distributor pool
  const { data: distributorPool, refetch: refetchDistributorPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getDistributorPool',
  });

  // Get RMS pool
  const { data: rmsPool, refetch: refetchRmsPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRawMaterialSupplierPool',
  });

  // Get Manufacturer Pool
  const { data: manufacturerPool, refetch: refetchManufacturerPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getManufacturerPool',
  });

  // Get Active Products
  const { data: activeProducts, refetch: refetchActiveProducts } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getActiveProducts',
  });

  // Get stats
  const { data: productCounter, refetch: refetchProductCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'productCounter',
  });

  const { data: orderCounter, refetch: refetchOrderCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'orderCounter',
  });

  const { data: returnCounter, refetch: refetchReturnCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'returnCounter',
  });

  const { data: returnWindow, refetch: refetchReturnWindow } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'returnWindow',
  });

  const { writeContract: writeUpdateReturnWindow, data: updateWindowHash, isPending: isUpdatingWindow, error: updateWindowError } = useWriteContract();
  const { isLoading: isUpdatingWindowConfirming, isSuccess: isUpdateWindowSuccess, isError: isUpdateWindowTxError } = useWaitForTransactionReceipt({
    hash: updateWindowHash,
  });

  // Remove Actor state
  const [removeActorAddress, setRemoveActorAddress] = useState('');
  const { writeContract: writeRemoveActor, data: removeHash, isPending: isRemoving, error: removeError } = useWriteContract();
  const { isLoading: isConfirmingRemoval, isSuccess: isRemoveSuccess, isError: isRemoveTxError } = useWaitForTransactionReceipt({
    hash: removeHash,
  });

  // Get all orders (owner can view all)
  const orderCount = orderCounter ? Number(orderCounter) : 0;
  const orderIds = Array.from({ length: orderCount }, (_, i) => BigInt(i + 1));

  // Toast notifications
  useEffect(() => {
    if (isPending) {
      toast.loading('Transaction pending...', { id: 'register-actor' });
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading('Waiting for confirmation...', { id: 'register-actor' });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Actor registered successfully!', { id: 'register-actor' });
      setActorAddress('');
      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries();
      refetchDistributorPool();
      refetchRmsPool();
      refetchManufacturerPool();
      refetchActiveProducts();
      refetchProductCounter();
      refetchOrderCounter();
    }
  }, [isSuccess, queryClient, refetchDistributorPool, refetchRmsPool, refetchManufacturerPool, refetchActiveProducts, refetchProductCounter, refetchOrderCounter]);

  const handleUpdateReturnWindow = () => {
    if (!returnWindowDays || parseFloat(returnWindowDays) <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }
    const daysInSeconds = BigInt(Math.floor(parseFloat(returnWindowDays) * 86400));
    toast.loading(`Updating return window to ${returnWindowDays} days...`, { id: 'update-window' });
    writeUpdateReturnWindow({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'updateReturnWindow',
      args: [daysInSeconds],
    });
  };

  useEffect(() => {
    if (writeError || isTxError) {
      toast.error(writeError?.message || 'Transaction failed', { id: 'register-actor' });
    }
  }, [writeError, isTxError]);

  // Toast notifications for update return window
  useEffect(() => {
    if (isUpdatingWindow) toast.loading('Updating return window...', { id: 'update-window' });
  }, [isUpdatingWindow]);
  useEffect(() => {
    if (isUpdatingWindowConfirming) toast.loading('Waiting for confirmation...', { id: 'update-window' });
  }, [isUpdatingWindowConfirming]);
  useEffect(() => {
    if (isUpdateWindowSuccess) {
      toast.success('Return window updated successfully!', { id: 'update-window' });
      setReturnWindowDays('');
      queryClient.invalidateQueries();
      refetchReturnWindow();
    }
  }, [isUpdateWindowSuccess, queryClient, refetchReturnWindow]);
  useEffect(() => {
    if (updateWindowError || isUpdateWindowTxError) {
      toast.error(updateWindowError?.message || 'Failed to update return window', { id: 'update-window' });
    }
  }, [updateWindowError, isUpdateWindowTxError]);

  // Remove Actor Effects
  useEffect(() => {
    if (isRemoving) toast.loading('Removing actor...', { id: 'remove-actor' });
  }, [isRemoving]);

  useEffect(() => {
    if (isConfirmingRemoval) toast.loading('Waiting for confirmation...', { id: 'remove-actor' });
  }, [isConfirmingRemoval]);

  useEffect(() => {
    if (isRemoveSuccess) {
      toast.success('Actor removed successfully!', { id: 'remove-actor' });
      setRemoveActorAddress('');
      queryClient.invalidateQueries();
      refetchDistributorPool();
      refetchRmsPool();
      refetchManufacturerPool();
    }
  }, [isRemoveSuccess, queryClient, refetchDistributorPool, refetchRmsPool, refetchManufacturerPool]);

  useEffect(() => {
    if (removeError || isRemoveTxError) {
      toast.error(removeError?.message || 'Failed to remove actor', { id: 'remove-actor' });
    }
  }, [removeError, isRemoveTxError]);

  const handleRemoveActor = () => {
    if (!removeActorAddress) {
      toast.error('Please enter an actor address');
      return;
    }

    toast.loading(`Removing actor ${removeActorAddress.slice(0, 6)}...`, { id: 'remove-actor' });

    writeRemoveActor({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'removeActor',
      args: [removeActorAddress],
    });
  };

  const handleRegister = () => {
    if (!actorAddress) {
      toast.error('Please enter an actor address');
      return;
    }

    const roleNames = {
      '0': 'Consumer',
      '1': 'Manufacturer',
      '2': 'Raw Material Supplier',
      '3': 'Distributor',
    };

    toast.loading(`Registering ${roleNames[selectedRole]}...`, { id: 'register-actor' });

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerActor',
      args: [actorAddress, BigInt(selectedRole)],
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 bg-background min-h-screen max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Professional Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage actors and monitor the system.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register Actor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Actor Address</label>
            <Input
              placeholder="0x..."
              value={actorAddress}
              onChange={(e) => setActorAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="0">Consumer (C: 0)</option>
              <option value="1">Manufacturer (MFR: 1)</option>
              <option value="2">Raw Material Supplier (RMS: 2)</option>
              <option value="3">Distributor (DR: 3)</option>
            </Select>
          </div>
          <Button
            onClick={handleRegister}
            disabled={isPending || isConfirming || !actorAddress}
          >
            {isPending || isConfirming ? 'Registering...' : 'Register Actor'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
            Remove Actor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Actor Address to Remove</label>
            <Input
              placeholder="0x..."
              value={removeActorAddress}
              onChange={(e) => setRemoveActorAddress(e.target.value)}
            />
          </div>
          <Button
            onClick={handleRemoveActor}
            variant="destructive"
            disabled={isRemoving || isConfirmingRemoval || !removeActorAddress}
          >
            {isRemoving || isConfirmingRemoval ? 'Removing...' : 'Remove Actor'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{productCounter?.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in marketplace</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{orderCounter?.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Distributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{distributorPool?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In the pool</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{returnCounter?.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Return requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Return Window Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Return Window</label>
            <div className="text-lg font-semibold text-foreground">
              {returnWindow ? `${Number(returnWindow) / 86400} days` : 'Loading...'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Return Window (Days)</label>
            <Input
              type="number"
              placeholder="e.g., 7"
              value={returnWindowDays}
              onChange={(e) => setReturnWindowDays(e.target.value)}
              className="w-full max-w-xs"
            />
          </div>
          <Button
            onClick={handleUpdateReturnWindow}
            disabled={isUpdatingWindow || isUpdatingWindowConfirming || !returnWindowDays}
          >
            {isUpdatingWindow || isUpdatingWindowConfirming ? 'Updating...' : 'Update Return Window'}
          </Button>
        </CardContent>
      </Card>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader className="border-b border-border/60 bg-card/30">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Network Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Manufacturers</h3>
                {manufacturerPool && manufacturerPool.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableBody>
                        {manufacturerPool.map((address, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs py-2">{address}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No manufacturers active.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Distributors</h3>
                {distributorPool && distributorPool.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableBody>
                        {distributorPool.map((address, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs py-2">{address}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No distributors active.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Raw Material Suppliers</h3>
                {rmsPool && rmsPool.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableBody>
                        {rmsPool.map((address, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs py-2">{address}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No RMS active.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="border-b border-border/60 bg-card/30">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Product Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeProducts && activeProducts.length > 0 ? (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProducts.map((product) => (
                      <TableRow key={product.productId.toString()}>
                        <TableCell className="font-mono">#{product.productId.toString()}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{formatEther(product.price)} ETH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Inventory empty.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            All Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderCount > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Track</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderIds.map((orderId) => (
                  <OrderRow
                    key={orderId.toString()}
                    bookingId={orderId}
                    onTrack={() => setSelectedOrder(selectedOrder === orderId ? null : orderId)}
                    isSelected={selectedOrder === orderId}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No orders in the system yet.
            </div>
          )}
        </CardContent>
      </Card>

      {
        selectedOrder && (
          <AIOrderSummary bookingId={selectedOrder} />
        )
      }
    </div >
  );
}

function OrderRow({ bookingId, onTrack, isSelected }) {
  const { data: order } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOrder',
    args: [bookingId],
  });

  const { data: product } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getProduct',
    args: [order?.productId],
    query: {
      enabled: !!order,
    },
  });

  const getStatusBadge = (status) => {
    const statusMap = [
      { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      { label: 'Materials Req.', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      { label: 'Materials Sent', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      { label: 'Production', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      { label: 'Ready to Ship', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
      { label: 'In Transit', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      { label: 'Delivered', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      { label: 'Return Req.', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      { label: 'Return Transit', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
      { label: 'Return Recv.', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
      { label: 'Refunded', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
    ];

    const s = statusMap[status] || { label: 'Unknown', color: 'bg-gray-500/10 text-gray-500' };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  if (!order) return <TableRow><TableCell colSpan={6} className="h-12 text-center text-muted-foreground animate-pulse">Loading...</TableCell></TableRow>;

  return (
    <TableRow className="hover:bg-accent/5">
      <TableCell className="font-mono font-medium">#{bookingId.toString()}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{product?.name || 'Loading...'}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">ID: {order.productId.toString()}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={order.consumer}>{order.consumer}</div>
      </TableCell>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell className="text-right font-medium">{order ? formatEther(order.pricePaid) : '0'} ETH</TableCell>
      <TableCell className="text-center">
        <Button
          size="sm"
          variant={isSelected ? "secondary" : "ghost"}
          onClick={onTrack}
          className="h-8 w-8 p-0 rounded-full"
        >
          {isSelected ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

