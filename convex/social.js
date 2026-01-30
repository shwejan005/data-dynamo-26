import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============= POSTS =============

export const createPost = mutation({
  args: {
    content: v.string(),
    platform: v.string(),
    campaignId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    scheduledFor: v.optional(v.string()),
    hasMedia: v.optional(v.boolean()),
    altText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("scheduledPosts", {
      content: args.content,
      platform: args.platform,
      campaignId: args.campaignId,
      imageUrl: args.imageUrl,
      scheduledFor: args.scheduledFor,
      hasMedia: args.hasMedia,
      altText: args.altText,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePost = mutation({
  args: {
    id: v.id("scheduledPosts"),
    content: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    scheduledFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, {
      ...filtered,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updatePostStatus = mutation({
  args: {
    id: v.id("scheduledPosts"),
    status: v.string(),
    error: v.optional(v.string()),
    postUri: v.optional(v.string()),
    postedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, {
      ...filtered,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deletePost = mutation({
  args: { id: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getPosts = query({
  args: {
    status: v.optional(v.string()),
    platform: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db.query("scheduledPosts").order("desc").collect();
    
    if (args.status) {
      posts = posts.filter((p) => p.status === args.status);
    }
    if (args.platform) {
      posts = posts.filter((p) => p.platform === args.platform);
    }
    
    return posts;
  },
});

export const getPostById = query({
  args: { id: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPostStats = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("scheduledPosts").collect();
    
    const stats = {
      total: posts.length,
      draft: posts.filter((p) => p.status === "draft").length,
      pending_approval: posts.filter((p) => p.status === "pending_approval").length,
      approved: posts.filter((p) => p.status === "approved").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      posted: posts.filter((p) => p.status === "posted").length,
      failed: posts.filter((p) => p.status === "failed").length,
    };
    
    return stats;
  },
});

// ============= BLUESKY ACCOUNTS =============

export const getBlueskyAccount = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("blueskyAccounts").take(1);
    return accounts[0] || null;
  },
});

export const saveBlueskyAccount = mutation({
  args: {
    handle: v.string(),
    did: v.string(),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("blueskyAccounts").take(1);
    
    if (existing.length > 0) {
      return await ctx.db.patch(existing[0]._id, {
        ...args,
        connectedAt: new Date().toISOString(),
      });
    }
    
    return await ctx.db.insert("blueskyAccounts", {
      ...args,
      connectedAt: new Date().toISOString(),
    });
  },
});

export const disconnectBluesky = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("blueskyAccounts").collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
    return true;
  },
});
