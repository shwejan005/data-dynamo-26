import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// ============= CAMPAIGNS (Unified with Studio) =============

export const createCampaign = mutation({
  args: {
    brandName: v.string(),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();
    const id = await ctx.db.insert("campaigns", {
      ...args,
      userId: user.clerkId,
      status: "draft",
      currentStep: 1,
      progressLog: [],
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const getCampaigns = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let campaigns;
    if (args.userId) {
      campaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      campaigns = await ctx.db.query("campaigns").collect();
    }

    return await Promise.all(
      campaigns.map(async (campaign) => {
        if (campaign.logo && !campaign.logo.startsWith("http") && !campaign.logo.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(campaign.logo);
            if (url) {
              return { ...campaign, logo: url };
            }
          } catch (e) {
            console.error("Failed to generate URL for logo:", campaign.logo, e);
          }
        }
        return campaign;
      })
    );
  },
});

export const getCampaignById = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (campaign && campaign.logo && !campaign.logo.startsWith("http") && !campaign.logo.startsWith("data:")) {
      try {
        const url = await ctx.storage.getUrl(campaign.logo);
        if (url) {
          return { ...campaign, logo: url };
        }
      } catch (e) {
        console.error("Failed to generate URL for logo:", campaign.logo, e);
      }
    }
    return campaign;
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    brandName: v.optional(v.string()),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    currentStep: v.optional(v.number()),
    pdfContent: v.optional(v.string()),
    pdfSummary: v.optional(v.string()),
    visualStyle: v.optional(v.string()),
    characters: v.optional(v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      referenceImage: v.optional(v.string()),
      generatedViews: v.optional(v.array(v.string())),
    }))),
    script: v.optional(v.string()),
    scenes: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      dialogue: v.optional(v.string()),
      characters: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
    }))),
    locations: v.optional(v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
    }))),
    thumbnails: v.optional(v.array(v.object({
      sceneId: v.string(),
      imageUrl: v.string(),
    }))),
    videoClips: v.optional(v.array(v.object({
      sceneId: v.string(),
      videoUrl: v.string(),
      duration: v.optional(v.number()),
    }))),
    finalVideoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, {
      ...filtered,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addProgressLog = mutation({
  args: {
    id: v.id("campaigns"),
    step: v.number(),
    action: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");

    const existingLog = (campaign.progressLog || []).find(
      (log) => log.action === args.action && log.step === args.step
    );

    let progressLog;
    
    if (existingLog) {
      progressLog = (campaign.progressLog || []).map((log) =>
        log.action === args.action && log.step === args.step
          ? { ...log, status: args.status, timestamp: new Date().toISOString() }
          : log
      );
    } else {
      const newLog = {
        step: args.step,
        action: args.action,
        status: args.status,
        timestamp: new Date().toISOString(),
      };
      progressLog = [...(campaign.progressLog || []), newLog];
    }

    return await ctx.db.patch(args.id, {
      progressLog,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const addStudioMessage = mutation({
  args: {
    id: v.id("campaigns"),
    role: v.string(),
    content: v.string(),
    toolCalls: v.optional(v.array(v.object({
      action: v.string(),
      status: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");

    const newMessage = {
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls || [],
      timestamp: new Date().toISOString(),
    };

    const studioMessages = [...(campaign.studioMessages || []), newMessage];

    return await ctx.db.patch(args.id, {
      studioMessages,
      updatedAt: new Date().toISOString(),
    });
  },
});

// ============= LEGACY SUPPORT (for old onboardings table) =============
// Keep these for backward compatibility during migration

export const saveOnboarding = mutation({
  args: {
    brandName: v.string(),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();
    // Create in new campaigns table
    const id = await ctx.db.insert("campaigns", {
      ...args,
      userId: user.clerkId,
      status: "draft",
      currentStep: 1,
      progressLog: [],
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const getOnboardings = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Query from campaigns table
    let campaigns;
    if (args.userId) {
      campaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      campaigns = await ctx.db.query("campaigns").collect();
    }

    return await Promise.all(
      campaigns.map(async (campaign) => {
        if (campaign.logo && !campaign.logo.startsWith("http") && !campaign.logo.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(campaign.logo);
            if (url) {
              return { ...campaign, logo: url };
            }
          } catch (e) {
            console.error("Failed to generate URL for logo:", campaign.logo, e);
          }
        }
        return campaign;
      })
    );
  },
});

export const getOnboardingById = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (campaign && campaign.logo && !campaign.logo.startsWith("http") && !campaign.logo.startsWith("data:")) {
      try {
        const url = await ctx.storage.getUrl(campaign.logo);
        if (url) {
          return { ...campaign, logo: url };
        }
      } catch (e) {
        console.error("Failed to generate URL for logo:", campaign.logo, e);
      }
    }
    return campaign;
  },
});

export const updateOnboarding = mutation({
  args: {
    id: v.id("campaigns"),
    brandName: v.optional(v.string()),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const deleteOnboarding = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
