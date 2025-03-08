import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { SiDiscord, SiFarcaster } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { Bounty } from "@shared/schema";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { formatTextWithLinks } from "@/lib/utils";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const { toast } = useToast();

  const openDiscordDM = () => {
    if (!bounty.discordHandle) return;
    // Copy to clipboard
    navigator.clipboard.writeText(bounty.discordHandle);

    // Show toast
    toast({
      description: `Copied ${bounty.discordHandle} to clipboard`,
    });

    // Open Discord
    window.open(`discord://discord.com/users/${encodeURIComponent(bounty.discordHandle)}`, '_blank');
  };

  const openFarcaster = () => {
    if (!bounty.farcasterHandle) return;
    // Copy to clipboard
    navigator.clipboard.writeText(bounty.farcasterHandle);

    // Show toast
    toast({
      description: `Copied ${bounty.farcasterHandle} to clipboard`,
    });

    // Open Warpcast
    window.open(`https://warpcast.com/${bounty.farcasterHandle.replace('@', '')}`, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{bounty.title}</CardTitle>
          <div className="flex gap-2">
            {bounty.farcasterHandle && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                <SiFarcaster className="h-3 w-3 mr-1" />
                Farcaster
              </Badge>
            )}
            <Badge variant={bounty.status === "open" ? "default" : "secondary"}>
              {bounty.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground mb-4 line-clamp-2">
          {formatTextWithLinks(bounty.description)}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          {bounty.discordHandle ? (
            <Button 
              variant="ghost" 
              onClick={openDiscordDM}
              className="h-auto p-0 text-muted-foreground hover:text-primary flex items-center gap-2"
            >
              <SiDiscord className="h-4 w-4" />
              {bounty.discordHandle}
              <ExternalLink className="h-3 w-3" />
            </Button>
          ) : bounty.farcasterHandle ? (
            <Button 
              variant="ghost" 
              onClick={openFarcaster}
              className="h-auto p-0 text-muted-foreground hover:text-purple-600 flex items-center gap-2"
            >
              <SiFarcaster className="h-4 w-4" />
              {bounty.farcasterHandle}
              <ExternalLink className="h-3 w-3" />
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Posted {formatDistanceToNow(new Date(bounty.createdAt))} ago</span>
        </div>

        {bounty.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            <span>Due {new Date(bounty.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-lg font-bold">${Number(bounty.usdcAmount).toFixed(2)} USDC</span>
        {bounty.status === "open" && (
          <Link href={`/bounty/${bounty.id}`}>
            <Button className="flex items-center gap-2">
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}