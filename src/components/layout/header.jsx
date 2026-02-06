import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';

export function Header() {
  const { address, isConnected } = useAccount();
  const { role } = useRole();
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-header text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h15l-1.5 9h-13zM6 6l-2 0M9 20a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate">AI Supply Chain Commerce</h1>
              <p className="text-xs text-white/70 truncate">Professional ecommerce + logistics dashboard</p>
            </div>
          </div>

          {isConnected && role && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="truncate">Role: <span className="text-foreground font-medium">{role}</span></span>
              {address && (
                <span className="hidden md:inline text-muted-foreground">
                  • {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ConnectButton.Custom>
            {({ openConnectModal, account, mounted }) => (
              <div
                aria-hidden={!mounted}
                className="inline-flex"
              >
                {account ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white px-4 h-9"
                    >
                      {account.displayName}
                    </Button>
                    <Button
                      onClick={() => disconnect()}
                      className="h-9 px-3 rounded-full bg-primary hover:bg-secondary text-primary-foreground"
                      title="Disconnect wallet"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={openConnectModal}
                    className="rounded-full h-9 px-5 font-medium bg-primary hover:bg-secondary text-primary-foreground"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            )}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}

