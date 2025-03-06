import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { Bounty } from "@shared/schema";

export default function BountyDetails({ params }: { params: { id: string } }) {
  const { data: bounty, isLoading } = useQuery<Bounty>({
    queryKey: [`/api/bounties/${params.id}`],
  });

  const openDiscordDM = () => {
    // Discord's direct message URL format
    window.open(`discord:///users/${bounty?.discordHandle}`, '_blank');
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
        </CardContent>
      </Card>
    </div>
  );
}
