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
  Owner: 'Professional Dashboard',
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
    <aside className="w-72 shrink-0 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 h-[calc(100vh-6.5rem)] sticky top-20">
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/40">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{roleLabels[role] || 'Dashboard'}</div>
          <div className="text-xs text-muted-foreground truncate">Welcome back</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current role</div>
          <div className="text-sm font-medium text-foreground">{role}</div>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/30 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Quick tips</div>
          <ul className="mt-1 text-xs text-muted-foreground space-y-1">
            <li>Use the tables to track orders and actions.</li>
            <li>Confirm transactions in your wallet when prompted.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

