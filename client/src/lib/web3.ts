import { ethers } from "ethers";

const USDC_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// Base network USDC contract address
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

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