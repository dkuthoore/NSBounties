import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Wallet } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { Bounty } from "@shared/schema";
import { Link } from "wouter";

export function BountyCard({ bounty }: { bounty: Bounty }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{bounty.title}</CardTitle>
          <Badge variant={bounty.status === "open" ? "default" : "secondary"}>
            {bounty.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{bounty.description}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <SiDiscord className="h-4 w-4" />
          <span>{bounty.discordHandle}</span>
        </div>

        {bounty.creatorAddress && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span>{bounty.creatorAddress.slice(0, 6)}...{bounty.creatorAddress.slice(-4)}</span>
          </div>
        )}

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
            <Button>View Details</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}