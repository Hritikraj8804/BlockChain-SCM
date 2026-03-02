import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';

export function Header({ isDark, toggleTheme }) {
  const { address, isConnected } = useAccount();
  const { role } = useRole();
  const { disconnect } = useDisconnect();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md text-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary border-primary/20 text-primary-foreground flex items-center justify-center">
              <img src="/logo.svg" alt="AI SCM Logo" className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">AI Supply Chain Commerce</h1>
              <p className="text-xs text-muted-foreground truncate">Professional ecommerce + logistics dashboard</p>
            </div>
          </div>

          {isConnected && role && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" />
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
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-card/40 hover:bg-card/80 text-muted-foreground hover:text-foreground transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? (
              /* Sun icon */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

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
                      className="rounded-full border-luxury/40 bg-charcoal/60 hover:bg-charcoal/80 text-foreground px-4 h-9"
                    >
                      {account.displayName}
                    </Button>
                    <Button
                      onClick={() => disconnect()}
                      className="h-9 px-3 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground"
                      title="Disconnect wallet"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={openConnectModal}
                    className="rounded-full h-9 px-5 font-medium bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-primary-foreground"
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

