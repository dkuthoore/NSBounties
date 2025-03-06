import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet-connect";
import { connectWallet, transferUSDC } from "@/lib/web3";
import type { Bounty } from "@shared/schema";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function ManageBounty({ params }: { params: { url: string } }) {
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [, setLocation] = useLocation();

  const { data: bounty, isLoading } = useQuery<Bounty>({
    queryKey: [`/api/bounties/manage/${params.url}`],
  });

  const completeBounty = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/bounties/${bounty!.id}/status`, {
        status: "closed",
        recipientAddress,
      });
      return res.json();
    },
  });

  if (isLoading || !bounty) {
    return <div>Loading...</div>;
  }

  if (bounty.status === "closed") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bounty Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This bounty has been marked as complete.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      const { signer } = await connectWallet();
      await transferUSDC(signer, recipientAddress, bounty.usdcAmount.toString());
      await completeBounty.mutateAsync();
      toast({ title: "Payment successful" });
      setLocation("/");
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Bounty: {bounty.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Address
            </label>
            <Input
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Amount to Pay
            </label>
            <div className="text-2xl font-bold">${Number(bounty.usdcAmount).toFixed(2)} USDC</div>
          </div>

          <div className="flex gap-4">
            <WalletConnect />
            <Button 
              onClick={handlePayment}
              disabled={!recipientAddress || completeBounty.isPending}
            >
              Complete & Pay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}