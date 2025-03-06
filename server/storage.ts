import { bounties, type Bounty, type InsertBounty } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  createBounty(bounty: InsertBounty): Promise<Bounty>;
  getBounty(id: string): Promise<Bounty | undefined>;
  getBountyByManagementUrl(url: string): Promise<Bounty | undefined>;
  listBounties(): Promise<Bounty[]>;
  updateBountyStatus(id: string, status: "open" | "closed", recipientAddress?: string): Promise<Bounty>;
}

export class DatabaseStorage implements IStorage {
  async createBounty(insertBounty: InsertBounty): Promise<Bounty> {
    const managementUrl = nanoid(32);
    const now = new Date();
    const [bounty] = await db
      .insert(bounties)
      .values({
        ...insertBounty,
        managementUrl,
        updatedAt: now,
        createdAt: now,
      })
      .returning();
    return bounty;
  }

  async getBounty(id: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.id, id));
    return bounty;
  }

  async getBountyByManagementUrl(url: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.managementUrl, url));
    return bounty;
  }

  async listBounties(): Promise<Bounty[]> {
    return db.select().from(bounties).orderBy(desc(bounties.createdAt));
  }

  async updateBountyStatus(id: string, status: "open" | "closed", recipientAddress?: string): Promise<Bounty> {
    const [bounty] = await db
      .update(bounties)
      .set({ 
        status,
        recipientAddress,
        updatedAt: new Date(),
      })
      .where(eq(bounties.id, id))
      .returning();
    return bounty;
  }
}

export const storage = new DatabaseStorage();