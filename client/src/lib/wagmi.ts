import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

export const config = getDefaultConfig({
  appName: 'NS Bounties',
  projectId: "REQUIRED_PROJECT_ID", // You'll need to get this from WalletConnect
  chains: [base],
});

export { base as chain };