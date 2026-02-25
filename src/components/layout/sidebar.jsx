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
    <aside className="w-72 shrink-0 rounded-r-xl border-r border-border bg-charcoal/60 backdrop-blur-sm p-4 h-[calc(100vh-6.5rem)] sticky top-20">
      <div className="flex items-center gap-3 p-3 rounded-lg border-luxury/60 bg-gradient-to-br from-card to-muted/30">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent-purple to-accent-purple/60 flex items-center justify-center">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{roleLabels[role] || 'Dashboard'}</div>
          <div className="text-xs text-muted-foreground truncate">Welcome back</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-lg border-luxury/60 bg-gradient-to-br from-background/50 to-muted/20 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Current role</div>
          <div className="text-sm font-medium text-accent-purple">{role}</div>
        </div>

        <div className="rounded-lg border-luxury/60 bg-gradient-to-br from-background/50 to-muted/20 px-3 py-2">
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

