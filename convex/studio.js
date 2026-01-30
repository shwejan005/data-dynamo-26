// Re-export studio functions from campaigns.js
export {
  getCampaignById as getProject,
  getCampaigns as getProjects,
  updateCampaign as updateProject,
  deleteCampaign as deleteProject,
  addProgressLog,
} from "./campaigns";

// Alias createCampaign as createProject for studio compatibility
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("campaigns", {
      brandName: args.title,
      status: "draft",
      currentStep: 1,
      progressLog: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProgressStatus = mutation({
  args: {
    id: v.id("campaigns"),
    action: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");

    const progressLog = (campaign.progressLog || []).map((log) =>
      log.action === args.action ? { ...log, status: args.status } : log
    );

    return await ctx.db.patch(args.id, {
      progressLog,
      updatedAt: new Date().toISOString(),
    });
  },
});
