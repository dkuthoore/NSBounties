import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBountySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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