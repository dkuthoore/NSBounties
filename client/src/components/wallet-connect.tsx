import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleConnect = async () => {
    try {
      if (isMobile) {
        // On mobile, show a message directing users to open in their wallet browser
        toast({
          title: "Open in Wallet Browser",
          description: "Please open this website directly in your wallet's browser (e.g. MetaMask, Rainbow, or Coinbase Wallet) to connect.",
          duration: 5000,
        });
        return;
      }

      // On desktop, proceed with normal connection
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