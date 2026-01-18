import { useRole } from '@/hooks/useRole';
import { Factory, Box, Truck, ShoppingCart, Settings, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const roleIcons = {
  Owner: Settings,
  Consumer: ShoppingCart,
  Manufacturer: Factory,
  RawMaterialSupplier: Box,
  Distributor: Truck,
};

const roleLabels = {
  Owner: 'Owner Dashboard',
  Consumer: 'Consumer Dashboard',
  Manufacturer: 'Manufacturer Dashboard',
  RawMaterialSupplier: 'RMS Dashboard',
  Distributor: 'Distributor Dashboard',
};

export function Sidebar() {
  const { role, isConnected } = useRole();

  if (!isConnected || !role) {
    return null;
  }

  const Icon = roleIcons[role] || Package;

  return (
    <div className="w-72 border-r border-blue-500/20 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{roleLabels[role] || 'Dashboard'}</h2>
          <p className="text-xs text-blue-100">Welcome back</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-blue-500/20 shadow-sm">
          <div className="text-xs font-medium text-gray-400 mb-1">Current Role</div>
          <div className="text-sm font-semibold text-blue-300">{role}</div>
        </div>
      </div>
    </div>
  );
}

