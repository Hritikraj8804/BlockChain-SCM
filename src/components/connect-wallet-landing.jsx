import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Zap, QrCode, Link2, ArrowUpRight
} from 'lucide-react';

const FEATURES = [
  { icon: Shield, title: 'On-Chain Escrow', desc: 'Funds locked until delivery is confirmed.' },
  { icon: Zap, title: 'Auto Assignment', desc: 'Distributors auto-assigned by smart contract.' },
  { icon: QrCode, title: 'QR Tracking', desc: 'Scan to verify the full chain of custody.' },
  { icon: Link2, title: 'Immutable Ledger', desc: 'Every event permanently written on-chain.' },
];

export function ConnectWalletLanding() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Minimal top nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-black text-xs">
            SC
          </div>
          <span className="font-bold text-sm tracking-wide text-foreground">AI Supply Chain</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Back to Home
        </button>
      </div>

      {/* Main connect panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left: connect card */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 text-primary text-xs font-bold uppercase tracking-[0.15em] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Blockchain Powered
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-3 leading-[1.1]">
                Connect your wallet<br />
                <span className="text-muted-foreground font-normal">to access the dashboard.</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Role-based access is determined automatically from the blockchain. Connect MetaMask and your dashboard loads instantly.
              </p>
            </div>

            {/* Connect button area */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Connect Wallet</div>
              <ConnectButton.Custom>
                {({ account, openConnectModal, mounted: rbMounted }) => (
                  <div aria-hidden={!rbMounted}>
                    {account ? (
                      <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{account.displayName}</div>
                          <div className="text-xs text-muted-foreground">Wallet connected — loading your role…</div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={openConnectModal}
                        className="w-full h-12 rounded-xl font-bold text-base text-primary-foreground bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        Connect MetaMask <ArrowUpRight size={18} />
                      </button>
                    )}
                  </div>
                )}
              </ConnectButton.Custom>
              <div className="text-xs text-muted-foreground text-center">
                Your role (Owner / Manufacturer / Consumer / etc.) is read directly from the smart contract.
              </div>
            </div>
          </div>

          {/* Right: feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Icon size={17} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground mb-1">{title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
