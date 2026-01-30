import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    name: v.string(),
    username: v.optional(v.string()), // now optional, we'll handle fallback
    email: v.string(),                // email required
    image: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by clerkId
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Auto-generate a username if not provided
    const generatedUsername =
      args.username ||
      args.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
      `user_${Math.random().toString(36).slice(2, 8)}`;

    // Insert new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      username: generatedUsername,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
    });

    return userId;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    return user || null;
  },
});