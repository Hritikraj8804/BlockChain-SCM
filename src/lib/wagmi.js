import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { defineChain } from 'viem';

// Helper function to create a custom chain
// Use this to define your custom chain with all required fields
export const createCustomChain = ({
  id,
  name,
  rpcUrl,
  nativeCurrency = { decimals: 18, name: 'Ether', symbol: 'ETH' },
  blockExplorerUrl = '',
}) => {
  return defineChain({
    id,
    name,
    nativeCurrency,
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
    blockExplorers: blockExplorerUrl
      ? {
          default: {
            name: 'Explorer',
            url: blockExplorerUrl,
          },
        }
      : undefined,
  });
};

// Custom chain configuration - replace with your chain details
// You can provide RPC URL and Chain ID when initializing
export const getWagmiConfig = (chainId, rpcUrl, chainName = 'Custom Chain') => {
  const customChain = createCustomChain({
    id: chainId,
    name: chainName,
    rpcUrl,
  });

  return getDefaultConfig({
    appName: 'AI Supply Chain',
    projectId: 'ffd9c14979b35512b37295583be3d623', // Get from https://cloud.walletconnect.com
    chains: [customChain, mainnet, sepolia, localhost],
    ssr: false,
  });
};

// ============================================
// ANVIL NETWORK CONFIGURATION
// ============================================
// Configured for Anvil (Foundry) local blockchain
// If you get a network name mismatch error, try changing the name to:
// - 'Localhost' (if your wallet shows "Localhost 8545")
// - 'Foundry' (if your wallet shows "Foundry Network")
// - Or whatever name your wallet displays for this network
const anvilChain = createCustomChain({
  id: 31337, // Anvil default chain ID
  name: 'Anvil', // Network name (must match what your wallet expects)
  rpcUrl: 'http://127.0.0.1:8545', // Anvil RPC URL
  blockExplorerUrl: '', // No block explorer for local Anvil
});

// Default config for development
// Using Anvil as the primary chain
export const defaultConfig = getDefaultConfig({
  appName: 'AI Supply Chain',
  projectId: 'ffd9c14979b35512b37295583be3d623',
  chains: [anvilChain, localhost, sepolia], // Anvil first, with fallbacks
  ssr: false,
});

