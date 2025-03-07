import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi';

// Create wagmi config
export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // Allow any injected provider, not just MetaMask
  ],
  transports: {
    [base.id]: http()
  }
});

// Create web3modal
export const web3modal = createWeb3Modal({
  wagmiConfig: config,
  projectId: "REQUIRED_PROJECT_ID",
  chains: [base],
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Rainbow
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],
  tokens: {
    [base.id]: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    }
  }
});