import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showMobileDialog, setShowMobileDialog] = useState(false);

  const handleConnect = async () => {
    try {
      if (isMobile) {
        setShowMobileDialog(true);
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
    <>
      <Button 
        onClick={handleConnect}
        className="text-sm whitespace-nowrap"
      >
        Connect Wallet
      </Button>

      <Dialog open={showMobileDialog} onOpenChange={setShowMobileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open in Web3 Wallet Browser</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                To connect your wallet, please open this website directly in your wallet's built-in browser:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>MetaMask Browser</li>
                <li>Rainbow Wallet Browser</li>
                <li>Coinbase Wallet Browser</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                This ensures a secure connection between your wallet and our application.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}