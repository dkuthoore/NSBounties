import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

export const config = getDefaultConfig({
  appName: 'NS Bounties',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID ?? "REQUIRED_PROJECT_ID",
  chains: [base],
});

export { base as chain };