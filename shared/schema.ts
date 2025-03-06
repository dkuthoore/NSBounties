import { pgTable, text, decimal, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bounties = pgTable("bounties", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  usdcAmount: decimal("usdc_amount", { precision: 10, scale: 2 }).notNull(),
  discordHandle: text("discord_handle").notNull(),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  deadline: timestamp("deadline"),
  managementUrl: text("management_url").notNull().unique(),
  recipientAddress: text("recipient_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBountySchema = createInsertSchema(bounties)
  .omit({ 
    id: true,
    managementUrl: true,
    recipientAddress: true,
    createdAt: true,
    updatedAt: true,
    status: true
  })
  .extend({
    deadline: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  });

export type InsertBounty = z.infer<typeof insertBountySchema>;
export type Bounty = typeof bounties.$inferSelect;