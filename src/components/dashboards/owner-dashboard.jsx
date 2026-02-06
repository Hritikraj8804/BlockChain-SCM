import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
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
      refetchProductCounter();
      refetchOrderCounter();
    }
  }, [isSuccess, queryClient, refetchDistributorPool, refetchProductCounter, refetchOrderCounter]);

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

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Distributor Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {distributorPool && distributorPool.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Index</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributorPool.map((address, index) => (
                  <TableRow key={index}>
                    <TableCell>{index}</TableCell>
                    <TableCell className="font-mono text-sm">{address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No distributors registered yet.
            </div>
          )}
        </CardContent>
      </Card>

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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Actions</TableHead>
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

      {selectedOrder && (
        <AIOrderSummary bookingId={selectedOrder} />
      )}
    </div>
  );
}

function OrderRow({ bookingId, onTrack, isSelected }) {
  return (
    <TableRow>
      <TableCell className="font-mono">#{bookingId.toString()}</TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onTrack()}
          className="shadow-sm hover:shadow-md"
        >
          {isSelected ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide Tracking
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Track Order
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}

