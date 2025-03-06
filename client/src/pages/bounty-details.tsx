import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { Bounty } from "@shared/schema";
import { useAccount } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function BountyDetails({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const { data: bounty, isLoading } = useQuery<Bounty>({
    queryKey: [`/api/bounties/${params.id}`],
  });

  const deleteBounty = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/bounties/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bounties"] });
      toast({ title: "Bounty deleted successfully" });
      setLocation("/");
    },
    onError: (err) => {
      toast({
        title: "Error deleting bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const closeBounty = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/bounties/${params.id}/status`, {
        status: "closed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bounties/${params.id}`] });
      toast({ title: "Bounty marked as closed" });
    },
    onError: (err) => {
      toast({
        title: "Error closing bounty",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const openDiscordDM = () => {
    if (!bounty?.discordHandle) return;

    // Copy to clipboard
    navigator.clipboard.writeText(bounty.discordHandle);

    // Show toast
    toast({
      description: `Copied ${bounty.discordHandle} to clipboard`,
    });

    // Open Discord
    window.open(`discord://discord.com/users/${encodeURIComponent(bounty.discordHandle)}`, '_blank');
  };

  if (isLoading || !bounty) {
    return (
      <div className="container mx-auto py-8">
        <Card className="animate-pulse">
          <CardContent className="h-64" />
        </Card>
      </div>
    );
  }

  const isCreator = address && bounty.creatorAddress === address;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{bounty.title}</CardTitle>
            <Badge variant={bounty.status === "open" ? "default" : "secondary"}>
              {bounty.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{bounty.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Reward</h3>
            <p className="text-2xl font-bold">${Number(bounty.usdcAmount).toFixed(2)} USDC</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <Button 
              variant="outline" 
              onClick={openDiscordDM}
              className="flex items-center gap-2"
            >
              <SiDiscord className="h-4 w-4" />
              {bounty.discordHandle}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDistanceToNow(new Date(bounty.createdAt))} ago</span>
            </div>

            {bounty.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Due {new Date(bounty.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {isCreator && bounty.status === "open" && (
            <div className="flex gap-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => closeBounty.mutate()}
                disabled={closeBounty.isPending}
              >
                Mark as Closed
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this bounty?")) {
                    deleteBounty.mutate();
                  }
                }}
                disabled={deleteBounty.isPending}
              >
                Delete Bounty
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}