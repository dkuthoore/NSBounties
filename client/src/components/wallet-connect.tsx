import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && !window.ethereum) {
        // If on mobile and no wallet detected, show guidance
        toast({
          title: "Mobile Wallet Required",
          description: "Please open this site in your wallet's browser (like MetaMask mobile) or use a browser with a wallet extension.",
          duration: 6000,
        });
        return;
      }

      connect({ connector: connectors[0] });
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Button>
        <Button variant="outline" onClick={() => disconnect()} className="text-sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="text-sm whitespace-nowrap"
    >
      Connect Wallet
    </Button>
  );
}