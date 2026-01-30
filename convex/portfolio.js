import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    // Determine the current user (placeholder for now as we might not have a specific 'context.auth' user logged in dev flow)
    // For now, aggregate global stats as 'User Stats' since strictly one-user context often.
    // If strict ID needed: 
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) return null;

    const sessions = await ctx.db.query("chatSessions").collect();
    const chats = await ctx.db.query("chats").collect(); // generations

    const campaigns = new Set(sessions.map((s) => s.campaignId));

    return {
      campaignsCreated: campaigns.size || sessions.length,
      totalGenerations: chats.length,
      // You might store 'joinedAt' in `users` table
      joinedAt: "March 2024", // Mock or fetch from users table
    };
  },
});

export const getVideoGenerations = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("chats").collect();
    // Filter in JS for now if no specialized index.
    // 'video' field added to schema.
    return all.filter(c => c.video !== undefined).reverse();
  },
});

export const getImageGenerations = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("chats").collect();
    return all.filter(c => c.image !== undefined).reverse();
  },
});
