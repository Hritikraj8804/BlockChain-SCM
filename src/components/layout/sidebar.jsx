import { useRole } from '@/hooks/useRole';
import { useAccount } from 'wagmi';
import {
  Factory, Box, Truck, ShoppingCart, Settings, Package,
  BarChart3, Layers, ArrowRight
} from 'lucide-react';

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
  Manufacturer: 'Manufacturer',
  RawMaterialSupplier: 'RMS Dashboard',
  Distributor: 'Distributor',
};

const roleDescriptions = {
  Owner: 'Manage actors & system',
  Consumer: 'Browse & track orders',
  Manufacturer: 'Products & inventory',
  RawMaterialSupplier: 'Supply & dispatch',
  Distributor: 'Deliveries & logistics',
};

const roleAccents = {
  Owner: { bar: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'bg-amber-500/10 text-amber-400' },
  Consumer: { bar: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'bg-blue-500/10 text-blue-400' },
  Manufacturer: { bar: 'bg-teal-500', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20', icon: 'bg-teal-500/10 text-teal-400' },
  RawMaterialSupplier: { bar: 'bg-violet-500', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: 'bg-violet-500/10 text-violet-400' },
  Distributor: { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'bg-emerald-500/10 text-emerald-400' },
};

export function Sidebar() {
  const { role, isConnected } = useRole();
  const { address } = useAccount();

  if (!isConnected || !role) return null;

  const Icon = roleIcons[role] || Package;
  const accents = roleAccents[role] || { bar: 'bg-primary', badge: 'bg-primary/10 text-primary border-primary/20', icon: 'bg-primary/10 text-primary' };

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-card/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">

      {/* Coloured accent top bar */}
      <div className={`h-0.5 w-full ${accents.bar}`} />

      <div className="flex flex-col gap-4 p-4 flex-1">

        {/* Role Identity Card */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accents.icon}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{roleLabels[role] || 'Dashboard'}</div>
              <div className="text-xs text-muted-foreground truncate">{roleDescriptions[role]}</div>
            </div>
          </div>
          {address && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="font-mono text-xs text-muted-foreground truncate">
                {address.slice(0, 8)}…{address.slice(-6)}
              </span>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${accents.badge}`}>
          <Layers size={13} />
          {role === 'RawMaterialSupplier' ? 'Raw Material Supplier' : role}
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-background/50 p-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Tips</span>
          </div>
          <ul className="space-y-2.5">
            {[
              'Confirm transactions in MetaMask when prompted.',
              'Tables update automatically after each on-chain action.',
              'Use the QR code to share order tracking links.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <ArrowRight size={10} className="mt-1 flex-shrink-0 text-primary/60" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </aside>
  );
}
