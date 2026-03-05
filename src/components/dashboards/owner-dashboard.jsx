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
import { AIOwnerAssistant } from '@/components/ai/AIOwnerAssistant';

export function OwnerDashboard() {
  const [actorAddress, setActorAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('0');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Payment share state
  const [newMfrShare, setNewMfrShare] = useState('');
  const [newRmsShare, setNewRmsShare] = useState('');
  const [newDistShare, setNewDistShare] = useState('');

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

  const { data: consumerCount, refetch: refetchConsumerCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'consumerCount',
  });

  const { data: consumerPool, refetch: refetchConsumerPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getConsumerPool',
  });

  // Payment shares
  const { data: paymentShares, refetch: refetchPaymentShares } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPaymentShares',
  });

  const { writeContract: writeUpdatePaymentShares, data: updateSharesHash, isPending: isUpdatingShares, error: updateSharesError } = useWriteContract();
  const { isLoading: isUpdatingSharesConfirming, isSuccess: isUpdateSharesSuccess, isError: isUpdateSharesTxError } = useWaitForTransactionReceipt({
    hash: updateSharesHash,
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
      refetchConsumerCount();
      refetchConsumerPool();
    }
  }, [isSuccess, queryClient, refetchDistributorPool, refetchRmsPool, refetchManufacturerPool, refetchActiveProducts, refetchProductCounter, refetchOrderCounter, refetchConsumerCount, refetchConsumerPool]);

  useEffect(() => {
    if (writeError || isTxError) {
      toast.error(writeError?.message || 'Transaction failed', { id: 'register-actor' });
    }
  }, [writeError, isTxError]);

  // Toast notifications for payment shares
  useEffect(() => {
    if (isUpdatingShares) toast.loading('Updating payment shares...', { id: 'update-shares' });
  }, [isUpdatingShares]);
  useEffect(() => {
    if (isUpdatingSharesConfirming) toast.loading('Waiting for confirmation...', { id: 'update-shares' });
  }, [isUpdatingSharesConfirming]);
  useEffect(() => {
    if (isUpdateSharesSuccess) {
      toast.success('Payment shares updated successfully!', { id: 'update-shares' });
      setNewMfrShare('');
      setNewRmsShare('');
      setNewDistShare('');
      queryClient.invalidateQueries();
      refetchPaymentShares();
    }
  }, [isUpdateSharesSuccess, queryClient, refetchPaymentShares]);
  useEffect(() => {
    if (updateSharesError || isUpdateSharesTxError) {
      toast.error(updateSharesError?.message || 'Failed to update payment shares', { id: 'update-shares' });
    }
  }, [updateSharesError, isUpdateSharesTxError]);

  const handleUpdatePaymentShares = () => {
    const mfr = parseFloat(newMfrShare) || 0;
    const rms = parseFloat(newRmsShare) || 0;
    const dist = parseFloat(newDistShare) || 0;

    if (mfr + rms + dist !== 100) {
      toast.error('Payment shares must total 100%');
      return;
    }

    // Convert percentages to basis points (multiply by 100)
    const mfrBp = BigInt(Math.round(mfr * 100));
    const rmsBp = BigInt(Math.round(rms * 100));
    const distBp = BigInt(Math.round(dist * 100));

    toast.loading(`Updating shares: MFR ${mfr}%, RMS ${rms}%, Dist ${dist}%...`, { id: 'update-shares' });
    writeUpdatePaymentShares({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'updatePaymentShares',
      args: [mfrBp, rmsBp, distBp],
    });
  };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Total Consumers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{consumerCount?.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered buyers</p>
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

        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Manufacturers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{manufacturerPool?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered factories</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Suppliers (RMS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{rmsPool?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Raw material suppliers</p>
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
            <p className="text-xs text-muted-foreground mt-1">Logistics partners</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/60 bg-card/30">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Payment Shares</label>
            {paymentShares ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-bold text-blue-400">{Number(paymentShares[0]) / 100}%</div>
                  <div className="text-xs text-muted-foreground">Manufacturer</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-lg font-bold text-green-400">{Number(paymentShares[1]) / 100}%</div>
                  <div className="text-xs text-muted-foreground">RMS</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-lg font-bold text-purple-400">{Number(paymentShares[2]) / 100}%</div>
                  <div className="text-xs text-muted-foreground">Distributor</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </div>
          <div className="border-t border-border/60 pt-4">
            <label className="text-sm font-medium text-foreground block mb-3">Update Payment Shares (%)</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Manufacturer</label>
                <Input
                  type="number"
                  placeholder="70"
                  value={newMfrShare}
                  onChange={(e) => setNewMfrShare(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">RMS</label>
                <Input
                  type="number"
                  placeholder="20"
                  value={newRmsShare}
                  onChange={(e) => setNewRmsShare(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Distributor</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newDistShare}
                  onChange={(e) => setNewDistShare(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total must equal 100%</p>
          </div>
          <Button
            onClick={handleUpdatePaymentShares}
            disabled={isUpdatingShares || isUpdatingSharesConfirming || !newMfrShare || !newRmsShare || !newDistShare}
          >
            {isUpdatingShares || isUpdatingSharesConfirming ? 'Updating...' : 'Update Payment Shares'}
          </Button>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="h-full col-span-1 lg:col-span-2">
          <CardHeader className="border-b border-border/60 bg-card/30">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Network Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manufacturers Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  <span>Manufacturers</span>
                  <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">{manufacturerPool?.length || 0}</span>
                </label>
                {manufacturerPool && manufacturerPool.length > 0 ? (
                  <Select className="w-full">
                    {manufacturerPool.map((address, index) => (
                      <option key={index} value={address}>
                        {address}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-2 border border-dashed border-border rounded-md bg-muted/20">
                    No manufacturers active
                  </div>
                )}
              </div>

              {/* Distributors Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  <span>Distributors</span>
                  <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">{distributorPool?.length || 0}</span>
                </label>
                {distributorPool && distributorPool.length > 0 ? (
                  <Select className="w-full">
                    {distributorPool.map((address, index) => (
                      <option key={index} value={address}>
                        {address}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-2 border border-dashed border-border rounded-md bg-muted/20">
                    No distributors active
                  </div>
                )}
              </div>

              {/* RMS Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  <span>Raw Material Suppliers</span>
                  <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">{rmsPool?.length || 0}</span>
                </label>
                {rmsPool && rmsPool.length > 0 ? (
                  <Select className="w-full">
                    {rmsPool.map((address, index) => (
                      <option key={index} value={address}>
                        {address}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-2 border border-dashed border-border rounded-md bg-muted/20">
                    No RMS active
                  </div>
                )}
              </div>

              {/* Consumers Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center justify-between">
                  <span>Consumers</span>
                  <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">{consumerPool?.length || 0}</span>
                </label>
                {consumerPool && consumerPool.length > 0 ? (
                  <Select className="w-full">
                    {consumerPool.map((address, index) => (
                      <option key={index} value={address}>
                        {address}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground italic p-2 border border-dashed border-border rounded-md bg-muted/20">
                    No consumers registered
                  </div>
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
                        <TableCell className="text-right font-medium text-price">{formatEther(product.price)} ETH</TableCell>
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

      {selectedOrder && (
        <AIOrderSummary bookingId={selectedOrder} />
      )}

      {/* Owner AI Assistant — floating chat */}
      <AIOwnerAssistant
        stats={{
          products: productCounter ? Number(productCounter) : 0,
          orders: orderCounter ? Number(orderCounter) : 0,
          returns: returnCounter ? Number(returnCounter) : 0,
          consumers: consumerCount?.toString() || 0,
          manufacturers: manufacturerPool?.length || 0,
          rms: rmsPool?.length || 0,
          distributors: distributorPool?.length || 0,
        }}
      />
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

    const s = statusMap[status] || { label: 'Unknown', color: 'bg-muted/10 text-muted-foreground' };
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
      <TableCell className="text-right font-medium text-price">{order ? formatEther(order.pricePaid) : '0'} ETH</TableCell>
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

