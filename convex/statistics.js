import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const onboardings = await ctx.db.query("onboardings").collect();
    const sessions = await ctx.db.query("chatSessions").collect();
    const messages = await ctx.db.query("messages").collect();

    // Calculate active campaigns (unique campaignIds in sessions)
    const campaigns = new Set(sessions.map((s) => s.campaignId));

    return {
      totalOnboarded: onboardings.length,
      totalSessions: sessions.length,
      totalMessages: messages.length,
      totalCampaigns: campaigns.size || sessions.length, // Fallback if campaignId reused or not strictly managed yet
    };
  },
});

export const getRecentOnboardings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("onboardings").order("desc").take(5);
  },
});

export const getPlatformDistribution = query({
  args: {},
  handler: async (ctx) => {
    const onboardings = await ctx.db.query("onboardings").collect();
    const counts = {};
    
    onboardings.forEach((o) => {
      o.platforms.forEach((p) => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const getCampaignsLast7Days = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("chatSessions").collect();
    
    // Group by date (simple implementation)
    // Note: ISO strings sort correctly, but we need to bucket by day
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        last7Days.push({ date: dateStr, count: 0, rawDate: d.toDateString() });
    }

    sessions.forEach(s => {
        const d = new Date(s.createdAt);
        const dateStr = d.toDateString();
        const bucket = last7Days.find(b => b.rawDate === dateStr);
        if (bucket) {
            bucket.count++;
        }
    });

    return last7Days.map(({ date, count }) => ({ date, count }));
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("chatSessions").order("desc").take(5);
    const recentSessionsWithStats = await Promise.all(
        sessions.map(async (s) => {
            // This is N+1 but okay for small 'recent' list. 
            // Better to index messages by sessionId if scale needed.
            const messages = await ctx.db
                .query("messages")
                .filter((q) => q.eq(q.field("sessionId"), s.sessionId))
                .collect();
            return {
                ...s,
                messageCount: messages.length
            };
        })
    );

    const messages = await ctx.db.query("messages").order("desc").take(5);

    return {
        sessions: recentSessionsWithStats,
        messages: messages
    };
  },
});
