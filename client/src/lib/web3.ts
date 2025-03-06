import { ethers } from "ethers";

const USDC_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Ethereum Mainnet USDC

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Web3 wallet found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getUSDCContract(signer: ethers.Signer) {
  return new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
}

export async function transferUSDC(signer: ethers.Signer, to: string, amount: string) {
  const contract = await getUSDCContract(signer);
  // USDC has 6 decimal places
  const parsedAmount = ethers.parseUnits(amount, 6);
  const tx = await contract.transfer(to, parsedAmount);
  return await tx.wait();
}