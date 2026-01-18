import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRole } from '@/hooks/useRole';

export function Header() {
  const { address, isConnected } = useAccount();
  const { role } = useRole();

  return (
    <header className="border-b border-blue-500/20 bg-slate-900/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI-Driven Ecommerce
              </h1>
              <p className="text-xs text-gray-400 font-medium">Blockchain based supply chain management</p>
            </div>
          </div>
          {isConnected && role && (
            <div className="ml-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
              <span className="text-xs font-semibold text-blue-300">{role}</span>
            </div>
          )}
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}

