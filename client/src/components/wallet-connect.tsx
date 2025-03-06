import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { connectWallet } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const [address, setAddress] = useState<string>();
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      const { signer } = await connectWallet();
      const address = await signer.getAddress();
      setAddress(address);
    } catch (err) {
      toast({
        title: "Error connecting wallet",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (address) {
    return (
      <Button variant="outline">
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={connect}>
      Connect Wallet
    </Button>
  );
}
