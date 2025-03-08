import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBountySchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sync bounties from bountycaster.xyz
  app.post("/api/bounties/sync", async (_req, res) => {
    try {
      // Fetch bounties from bountycaster
      const response = await axios.get('https://www.bountycaster.xyz/api/v1/bounties/open');
      const bounties = response.data.bounties;

      // Log the response structure
      console.log('Bountycaster API Response:', {
        responseStatus: response.status,
        totalBounties: bounties?.length || 0,
        sampleBounty: bounties?.[0]
      });

      // Filter bounties that contain @ns
      const filteredBounties = bounties.filter(bounty =>
        bounty.summary_text.toLowerCase().includes('@ns')
      );

      const results = [];

      // Process each filtered bounty
      for (const bounty of filteredBounties) {
        try {
          // Log the bounty data we're trying to process
          console.log('Processing bounty:', {
            title: bounty.title,
            rewardSummary: bounty.reward_summary,
            hasDiscordHandle: !!bounty.poster?.short_name
          });

          const bountyData = {
            title: bounty.title,
            description: bounty.summary_text,
            usdcAmount: bounty.reward_summary.usd_value,
            farcasterHandle: bounty.poster.short_name, // Use farcaster_handle instead of discord_handle
            deadline: bounty.expiration_date ? bounty.expiration_date : undefined,
            creatorAddress: undefined, // External bounties don't have this
          };

          // Check for duplicate bounty
          const existingBounty = await storage.findDuplicateBounty(bountyData.title, bountyData.farcasterHandle);

          if (existingBounty) {
            console.log('Skipping duplicate bounty:', {
              title: bountyData.title,
              farcasterHandle: bountyData.farcasterHandle
            });

            results.push({
              status: 'skipped',
              message: 'Duplicate bounty',
              bounty: bountyData.title
            });
            continue;
          }

          // Validate and create bounty using existing schema
          const validatedData = insertBountySchema.parse(bountyData);
          const createdBounty = await storage.createBounty(validatedData);
          results.push({
            status: 'success',
            bounty: createdBounty,
          });
        } catch (err) {
          console.error('Error processing bounty:', {
            bountyTitle: bounty.title,
            error: err instanceof Error ? err.message : 'Unknown error',
            bountyData: bounty
          });

          results.push({
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
            bounty: bounty.title,
          });
        }
      }

      res.json({
        total: filteredBounties.length,
        results,
      });
    } catch (err) {
      console.error('Error syncing bounties:', err);
      res.status(500).json({
        message: "Failed to sync bounties",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  // List bounties
  app.get("/api/bounties", async (_req, res) => {
    const bounties = await storage.listBounties();
    res.json(bounties);
  });

  // Get single bounty
  app.get("/api/bounties/:id", async (req, res) => {
    const bounty = await storage.getBounty(req.params.id);
    if (!bounty) {
      res.status(404).json({ message: "Bounty not found" });
      return;
    }
    res.json(bounty);
  });

  // Get bounty by management URL
  app.get("/api/bounties/manage/:url", async (req, res) => {
    const bounty = await storage.getBountyByManagementUrl(req.params.url);
    if (!bounty) {
      res.status(404).json({ message: "Bounty not found" });
      return;
    }
    res.json(bounty);
  });

  // Create bounty
  app.post("/api/bounties", async (req, res) => {
    try {
      const data = insertBountySchema.parse(req.body);
      const bounty = await storage.createBounty(data);
      res.json(bounty);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bounty data", errors: err.errors });
        return;
      }
      throw err;
    }
  });

  // Update bounty
  app.patch("/api/bounties/:id", async (req, res) => {
    try {
      const bounty = await storage.getBounty(req.params.id);
      if (!bounty) {
        res.status(404).json({ message: "Bounty not found" });
        return;
      }

      // Ensure the creator is updating their own bounty
      if (bounty.creatorAddress !== req.body.creatorAddress) {
        res.status(403).json({ message: "Not authorized to update this bounty" });
        return;
      }

      const data = insertBountySchema.partial().parse(req.body);
      const updatedBounty = await storage.updateBounty(req.params.id, data);
      res.json(updatedBounty);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bounty data", errors: err.errors });
        return;
      }
      throw err;
    }
  });

  // Update bounty status
  app.patch("/api/bounties/:id/status", async (req, res) => {
    const schema = z.object({
      status: z.enum(["open", "closed"]),
      recipientAddress: z.string().optional(),
    });

    try {
      const { status, recipientAddress } = schema.parse(req.body);
      const bounty = await storage.updateBountyStatus(req.params.id, status, recipientAddress);
      res.json(bounty);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: err.errors });
        return;
      }
      throw err;
    }
  });

  // Delete bounty
  app.delete("/api/bounties/:id", async (req, res) => {
    try {
      await storage.deleteBounty(req.params.id);
      res.json({ message: "Bounty deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete bounty" });
      throw err;
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}