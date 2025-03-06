import { useQuery } from "@tanstack/react-query";
import { BountyCard } from "@/components/bounty-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Plus } from "lucide-react";
import type { Bounty } from "@shared/schema";
import { useState } from "react";
import { useAccount } from 'wagmi';

export default function Home() {
  const [search, setSearch] = useState("");
  const [showMyBounties, setShowMyBounties] = useState(false);
  const { address } = useAccount();

  const { data: bounties = [], isLoading } = useQuery<Bounty[]>({
    queryKey: ["/api/bounties"],
  });

  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch = bounty.title.toLowerCase().includes(search.toLowerCase()) ||
      bounty.description.toLowerCase().includes(search.toLowerCase());

    if (showMyBounties && address) {
      // Show all bounties (open and closed) that belong to the user
      return matchesSearch && bounty.creatorAddress === address;
    }

    // Only show open bounties by default
    return matchesSearch && bounty.status === "open";
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4 items-center">
          {address && (
            <Button
              variant="outline"
              onClick={() => setShowMyBounties(!showMyBounties)}
              className={showMyBounties ? "bg-primary/20" : ""}
            >
              {showMyBounties ? "Show All Bounties" : "Show My Bounties"}
            </Button>
          )}
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Bounty
          </Button>
        </Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bounties..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  );
}