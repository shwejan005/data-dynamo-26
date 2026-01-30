import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const createSession = mutation({
  args: {
    campaignId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("chatSessions", {
      campaignId: args.campaignId,
      title: args.title,
      createdAt: new Date().toISOString(),
    })
    return sessionId
  },
})

export const getSessionsByCampaign = query({
  args: { campaignId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatSessions")
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .order("desc")
      .collect()
  },
})

export const getSessionById = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => await ctx.db.get(args.sessionId),
})

export const sendMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      createdAt: new Date().toISOString(),
    })
  },
})

export const getMessagesBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .order("asc")
      .collect()
  },
})