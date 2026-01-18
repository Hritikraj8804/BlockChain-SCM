import { useRole } from '@/hooks/useRole';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { OwnerDashboard } from '@/components/dashboards/owner-dashboard';
import { ConsumerDashboard } from '@/components/dashboards/consumer-dashboard';
import { ManufacturerDashboard } from '@/components/dashboards/manufacturer-dashboard';
import { RMSDashboard } from '@/components/dashboards/rms-dashboard';
import { DistributorDashboard } from '@/components/dashboards/distributor-dashboard';
import { ConnectWalletLanding } from '@/components/connect-wallet-landing';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';

import { CONTRACT_ADDRESS } from '@/constants/contract';

function App() {
  const { role, isLoading, isConnected, isOwner, ownerAddress, ownerError, roleError } = useRole();
  const { address } = useAccount();

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2 text-gray-200">Loading...</div>
            <div className="text-sm text-gray-400">Determining your role...</div>
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
          <div className="flex items-center justify-center min-h-screen">
            <Card className="bg-slate-800 border-blue-500/20">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-200">No Role Assigned</h2>
                <p className="text-gray-300 mb-2">
                  Your address ({address?.slice(0, 6)}...{address?.slice(-4)}) is not registered in the system.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 space-y-2 text-xs text-gray-400">
                    {ownerError && (
                      <p className="text-red-500">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/30">
      {isConnected && <Header />}
      <div className="flex">
        {isConnected && <Sidebar />}
        <main className="flex-1 overflow-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;

