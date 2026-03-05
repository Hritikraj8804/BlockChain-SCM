import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, ChevronLeft } from 'lucide-react';

const roleColors = {
  Owner: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Consumer: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Manufacturer: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
  RawMaterialSupplier: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  Distributor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

export function Header({ isDark, toggleTheme }) {
  const { address, isConnected } = useAccount();
  const { role } = useRole();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center border-b border-border bg-background/80 backdrop-blur-xl text-foreground px-4 sm:px-6 lg:px-8">

      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Back to Landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group"
          title="Back to Landing"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="w-px h-5 bg-border" />

        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-black text-xs shadow-sm shadow-primary/20 flex-shrink-0">
            SC
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="text-sm font-bold text-foreground leading-tight">AI Supply Chain</div>
            <div className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Dashboard</div>
          </div>
        </div>

        {/* Role badge */}
        {isConnected && role && (
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${roleColors[role] || 'bg-muted text-muted-foreground border-border'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {role === 'RawMaterialSupplier' ? 'RMS' : role}
            {address && (
              <span className="hidden lg:inline opacity-60 font-mono">
                · {address.slice(0, 6)}…{address.slice(-4)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="h-9 w-9 rounded-xl border border-border bg-card/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <ConnectButton.Custom>
          {({ openConnectModal, account, mounted }) => (
            <div aria-hidden={!mounted} className="inline-flex">
              {account ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card/50 text-sm font-medium text-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {account.displayName}
                  </div>
                  <button
                    onClick={() => disconnect()}
                    title="Disconnect wallet"
                    className="h-9 w-9 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openConnectModal}
                  className="h-9 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          )}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
