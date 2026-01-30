import { query } from "./_generated/server";
import { v } from "convex/values";

// Dashboard stats from campaigns
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    // Count by status
    const completed = campaigns.filter(c => c.status === "completed").length;
    const drafts = campaigns.filter(c => c.status === "draft").length;
    const inProgress = campaigns.filter(c => c.status === "in_progress").length;
    const withMedia = campaigns.filter(c => c.finalVideoUrl).length;

    return {
      totalCampaigns: campaigns.length,
      completedCampaigns: completed,
      draftCampaigns: drafts,
      inProgressCampaigns: inProgress,
      totalGenerations: withMedia,
      // Legacy fields for compatibility
      totalOnboarded: campaigns.length,
      totalSessions: campaigns.length,
      totalMessages: campaigns.reduce((sum, c) => sum + (c.studioMessages?.length || 0), 0),
    };
  },
});

// Recent campaigns (replaces recent onboardings)
export const getRecentOnboardings = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").order("desc").take(5);
    return campaigns.map(c => ({
      _id: c._id,
      brandName: c.brandName,
      status: c.status,
      visualStyle: c.visualStyle,
      currentStep: c.currentStep,
      hasMedia: !!c.finalVideoUrl,
      createdAt: c.createdAt,
      // Legacy field
      tone: c.visualStyle || "N/A",
    }));
  },
});

// Style distribution (replaces platform distribution)
export const getPlatformDistribution = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const counts = {};
    
    campaigns.forEach((c) => {
      const style = c.visualStyle || "Unknown";
      counts[style] = (counts[style] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  },
});

// Campaigns created in last 7 days
export const getCampaignsLast7Days = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      last7Days.push({ date: dateStr, count: 0, rawDate: d.toDateString() });
    }

    campaigns.forEach(c => {
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        const dateStr = d.toDateString();
        const bucket = last7Days.find(b => b.rawDate === dateStr);
        if (bucket) {
          bucket.count++;
        }
      }
    });

    return last7Days.map(({ date, count }) => ({ date, count }));
  },
});

// Recent activity from campaigns
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").order("desc").take(5);
    
    // Map campaigns as "sessions"
    const sessions = campaigns.map(c => ({
      _id: c._id,
      title: c.brandName,
      createdAt: c.createdAt,
      messageCount: c.studioMessages?.length || 0,
      currentStep: c.currentStep,
      status: c.status,
    }));

    // Get recent messages from campaigns
    const allMessages = [];
    campaigns.forEach(c => {
      if (c.studioMessages) {
        c.studioMessages.slice(-3).forEach(m => {
          allMessages.push({
            _id: `${c._id}_${m.timestamp}`,
            role: m.role,
            content: m.content.substring(0, 100),
            createdAt: m.timestamp,
            campaignName: c.brandName,
          });
        });
      }
    });

    // Sort by timestamp descending and take top 5
    const messages = allMessages
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      sessions,
      messages,
    };
  },
});

// Get campaigns with generated media
export const getCampaignsWithMedia = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    
    return campaigns
      .filter(c => c.finalVideoUrl)
      .map(c => ({
        _id: c._id,
        brandName: c.brandName,
        visualStyle: c.visualStyle,
        mediaUrl: c.finalVideoUrl,
        status: c.status,
        createdAt: c.createdAt,
      }))
      .reverse();
  },
});
