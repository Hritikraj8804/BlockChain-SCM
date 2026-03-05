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
import { useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contract';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TrackOrder } from '@/components/qr/TrackOrder';
import { LandingPage } from '@/components/landing/LandingPage';

function MainApp({ isDark, toggleTheme }) {
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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-foreground mb-1">Loading Dashboard</div>
              <div className="text-sm text-muted-foreground">Verifying your on-chain role…</div>
            </div>
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
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
            <div className="max-w-sm w-full rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">No Role Assigned</h2>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Address <span className="font-mono text-foreground">{address?.slice(0, 6)}…{address?.slice(-4)}</span> is not registered. Ask the Owner to assign you a role.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t border-border pt-4">
                  {ownerError && (
                    <p className="text-destructive">Cannot fetch contract owner at {CONTRACT_ADDRESS}</p>
                  )}
                  {ownerAddress && <p>Owner: {ownerAddress.slice(0, 6)}…{ownerAddress.slice(-4)}</p>}
                  {!ownerAddress && !ownerError && <p className="animate-pulse">Fetching contract owner…</p>}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isConnected && <Header isDark={isDark} toggleTheme={toggleTheme} />}
      <div className="flex flex-1 overflow-hidden">
        {isConnected && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    // Read persisted preference; default to dark
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('light');
    } else {
      html.classList.add('light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((d) => !d);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/app" element={<MainApp isDark={isDark} toggleTheme={toggleTheme} />} />
        <Route path="/track/order/:id" element={<TrackOrder />} />
      </Routes>
    </Router>
  );
}

