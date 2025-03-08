import { bounties } from "@shared/schema";
import type { InsertBounty } from "@shared/schema";
import { db } from "./db";
import { nanoid } from "nanoid";

interface BountycasterBounty {
  title: string;
  summary: string;
  amount_usd?: number;
  short_name: string;
  deadline?: string;
  tags: string[];
}

async function fetchBountycasterBounties(): Promise<BountycasterBounty[]> {
  try {
    const response = await fetch("https://www.bountycaster.xyz/api/v1/bounties/open");
    if (!response.ok) {
      throw new Error(`Failed to fetch bounties: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching bounties:", error);
    return [];
  }
}

function filterNSBounties(bounties: BountycasterBounty[]): BountycasterBounty[] {
  return bounties.filter(bounty => 
    bounty.tags.some(tag => tag.toLowerCase() === "@ns")
  );
}

async function syncBounty(externalBounty: BountycasterBounty) {
  // Convert external bounty to our format
  const bountyData: InsertBounty = {
    title: externalBounty.title,
    description: externalBounty.summary,
    usdcAmount: externalBounty.amount_usd?.toString() || "0",
    discordHandle: "bountycaster:" + externalBounty.short_name,
    deadline: externalBounty.deadline ? new Date(externalBounty.deadline) : undefined,
    managementUrl: `bountycaster-${nanoid()}`,
    creatorAddress: "0x0", // placeholder for external bounties
  };

  try {
    // Check if bounty already exists with this title and source
    const existingBounty = await db.select().from(bounties)
      .where(b => b.discordHandle.like(`bountycaster:${externalBounty.short_name}`))
      .execute();

    if (existingBounty.length === 0) {
      // Insert new bounty
      await db.insert(bounties).values(bountyData).execute();
      console.log(`Synced bounty: ${bountyData.title}`);
    }
  } catch (error) {
    console.error(`Failed to sync bounty ${bountyData.title}:`, error);
  }
}

export async function syncBountycasterBounties() {
  console.log("Starting bounty sync from Bountycaster...");
  const allBounties = await fetchBountycasterBounties();
  const nsBounties = filterNSBounties(allBounties);
  
  console.log(`Found ${nsBounties.length} NS bounties to sync`);
  
  for (const bounty of nsBounties) {
    await syncBounty(bounty);
  }
  
  console.log("Bounty sync completed");
}
