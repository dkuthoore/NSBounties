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
    deadline: z.union([
      z.string().refine(val => {
        if (!val) return true;
        const date = new Date(val);
        return date > new Date();
      }, "Deadline must be in the future"),
      z.string().length(0),
      z.null(),
      z.undefined()
    ]).transform(val => {
      if (!val) return undefined;
      if (val === '') return undefined;
      return new Date(val);
    }).optional(),
  });

export type InsertBounty = z.infer<typeof insertBountySchema>;
export type Bounty = typeof bounties.$inferSelect;