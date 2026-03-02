import { useRole } from '@/hooks/useRole';
import { Factory, Box, Truck, ShoppingCart, Settings, Package } from 'lucide-react';

const roleIcons = {
  Owner: Settings,
  Consumer: ShoppingCart,
  Manufacturer: Factory,
  RawMaterialSupplier: Box,
  Distributor: Truck,
};

const roleLabels = {
  Owner: 'Professional Dashboard',
  Consumer: 'Consumer Dashboard',
  Manufacturer: 'Manufacturer Dashboard',
  RawMaterialSupplier: 'RMS Dashboard',
  Distributor: 'Distributor Dashboard',
};

// Role accent colours — consistent across dark & light
const roleColors = {
  Owner: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Consumer: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Manufacturer: 'bg-teal-500/20 text-teal-500 border border-teal-500/30',
  RawMaterialSupplier: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
  Distributor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

export function Sidebar() {
  const { role, isConnected } = useRole();

  if (!isConnected || !role) return null;

  const Icon = roleIcons[role] || Package;
  const iconClass = roleColors[role] || 'bg-primary/20 text-primary border border-primary/30';

  return (
    <aside className="w-72 shrink-0 rounded-r-xl border-r border-border bg-card backdrop-blur-sm p-4 h-[calc(100vh-6.5rem)] sticky top-20">
      {/* Role card */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{roleLabels[role] || 'Dashboard'}</div>
          <div className="text-xs text-muted-foreground truncate">Welcome back</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current role</div>
          <div className="text-sm font-semibold text-primary mt-0.5">{role}</div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick tips</div>
          <ul className="mt-1 text-xs text-muted-foreground space-y-1">
            <li>Use tables to track orders and actions.</li>
            <li>Confirm transactions in your wallet when prompted.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
