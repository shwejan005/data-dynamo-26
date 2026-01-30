import { query } from "./_generated/server";
import { v } from "convex/values";

// Get user stats from campaigns
export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    // Count campaigns with generated media
    const withMedia = campaigns.filter(c => c.finalVideoUrl);
    
    return {
      name: "Creator",
      username: "@studio_user",
      campaignsCreated: campaigns.length,
      totalGenerations: withMedia.length,
      completedCampaigns: campaigns.filter(c => c.status === "completed").length,
      draftCampaigns: campaigns.filter(c => c.status === "draft").length,
      joinedAt: campaigns.length > 0 
        ? new Date(campaigns[0].createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Recently",
    };
  },
});

// Get campaigns with video/image generations
export const getVideoGenerations = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    // Filter campaigns that have finalVideoUrl (which stores videos or images)
    const withMedia = campaigns
      .filter(c => c.finalVideoUrl)
      .map(c => ({
        _id: c._id,
        brandName: c.brandName,
        visualStyle: c.visualStyle,
        status: c.status,
        mediaUrl: c.finalVideoUrl,
        isVideo: c.finalVideoUrl?.includes('.mp4') || c.finalVideoUrl?.includes('video'),
        createdAt: c.createdAt,
        currentStep: c.currentStep,
      }))
      .reverse();
    
    return withMedia;
  },
});

// Get all campaigns as portfolio items
export const getImageGenerations = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    // Filter campaigns with finalVideoUrl that are images (base64 or not video)
    const withImages = campaigns
      .filter(c => c.finalVideoUrl && !c.finalVideoUrl?.includes('.mp4') && !c.finalVideoUrl?.includes('video'))
      .map(c => ({
        _id: c._id,
        brandName: c.brandName,
        visualStyle: c.visualStyle,
        status: c.status,
        imageUrl: c.finalVideoUrl,
        createdAt: c.createdAt,
      }))
      .reverse();
    
    return withImages;
  },
});

// Get all campaigns for portfolio display
export const getAllCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    return campaigns.map(c => ({
      _id: c._id,
      brandName: c.brandName,
      visualStyle: c.visualStyle,
      status: c.status,
      currentStep: c.currentStep,
      hasMedia: !!c.finalVideoUrl,
      mediaUrl: c.finalVideoUrl,
      charactersCount: c.characters?.length || 0,
      scenesCount: c.scenes?.length || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })).reverse();
  },
});
