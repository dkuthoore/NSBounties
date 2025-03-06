import { useQuery } from "@tanstack/react-query";
import { BountyCard } from "@/components/bounty-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Plus } from "lucide-react";
import type { Bounty } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const { data: bounties = [], isLoading } = useQuery<Bounty[]>({
    queryKey: ["/api/bounties"],
  });

  const filteredBounties = bounties.filter(bounty => 
    bounty.title.toLowerCase().includes(search.toLowerCase()) ||
    bounty.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-8">
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