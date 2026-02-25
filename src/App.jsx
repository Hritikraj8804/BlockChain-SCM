import { useRole } from '@/hooks/useRole';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { OwnerDashboard } from '@/components/dashboards/owner-dashboard';
import { ConsumerDashboard } from '@/components/dashboards/consumer-dashboard';
import { ManufacturerDashboard } from '@/components/dashboards/manufacturer-dashboard';
import { RMSDashboard } from '@/components/dashboards/rms-dashboard';
import { DistributorDashboard } from '@/components/dashboards/distributor-dashboard';
import { ConnectWalletLanding } from '@/components/connect-wallet-landing';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';

function App() {
  const { role, isLoading, isConnected, isOwner, ownerAddress, ownerError, roleError } = useRole();
  const { address } = useAccount();

  // Check if user is already registered as consumer ON-CHAIN
  const { data: isAlreadyConsumer, isLoading: isCheckingConsumer } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isConsumer',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Only run when address exists
    },
  });

  // Auto-register consumers when they connect
  const { writeContract: registerConsumer, data: registerHash, isPending: isRegistering } = useWriteContract();
  const { isSuccess: isRegistered } = useWaitForTransactionReceipt({ hash: registerHash });

  useEffect(() => {
    // Auto-register as consumer when wallet connects and role is Consumer
    // Only register if:
    // 1. Connected with an address
    // 2. Role is loaded (not loading)
    // 3. Consumer check is loaded
    // 4. NOT already registered on-chain
    // 5. Role is Consumer (not Owner/MFR/RMS/Dist)
    // 6. Not the contract owner
    if (
      isConnected &&
      address &&
      !isLoading &&
      !isCheckingConsumer &&
      isAlreadyConsumer === false && // Explicitly check they're NOT registered
      role === 'Consumer' &&
      !isOwner
    ) {
      console.log('Auto-registering new consumer:', address);
      registerConsumer({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'registerAsConsumer',
      });
    }
  }, [isConnected, address, role, isOwner, isLoading, isCheckingConsumer, isAlreadyConsumer, registerConsumer]);

  useEffect(() => {
    if (isRegistered) {
      console.log('Consumer auto-registration confirmed!');
    }
  }, [isRegistered]);

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('RBAC Debug:', {
      address,
      role,
      isOwner,
      isLoading,
      isConnected,
      ownerAddress,
    });

    if (ownerError) {
      console.error('Contract owner() call failed:', ownerError);
      console.log('Contract address:', CONTRACT_ADDRESS);
      console.log('Make sure the contract is deployed at this address');
    }

    if (roleError) {
      console.error('Contract getActorRole() call failed:', roleError);
    }
  }

  const renderDashboard = () => {
    if (!isConnected) {
      return <ConnectWalletLanding />;
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2 text-foreground">Loading...</div>
            <div className="text-sm text-muted-foreground">Determining your role...</div>
          </div>
        </div>
      );
    }

    // Explicitly check for Owner first
    if (role === 'Owner' || isOwner) {
      return <OwnerDashboard />;
    }

    switch (role) {
      case 'Consumer':
        return <ConsumerDashboard />;
      case 'Manufacturer':
        return <ManufacturerDashboard />;
      case 'RawMaterialSupplier':
        return <RMSDashboard />;
      case 'Distributor':
        return <DistributorDashboard />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
            <Card className="bg-gradient-to-br from-card to-muted/30 border-luxury">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">No Role Assigned</h2>
                <p className="text-muted-foreground mb-2">
                  Your address ({address?.slice(0, 6)}...{address?.slice(-4)}) is not registered in the system.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {ownerError && (
                      <p className="text-destructive">
                        Error: Could not fetch contract owner. Make sure the contract is deployed at {CONTRACT_ADDRESS}
                      </p>
                    )}
                    {ownerAddress && (
                      <p>
                        Contract Owner: {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
                      </p>
                    )}
                    {!ownerAddress && !ownerError && (
                      <p>Loading contract owner...</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {isConnected && <Header />}
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-6">
        {isConnected && <Sidebar />}
        <main className="flex-1 overflow-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;

