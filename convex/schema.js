import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    name: v.string(),
    username: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  // Campaigns = Studio Projects (unified)
  campaigns: defineTable({
    userId: v.optional(v.string()),
    // Brand Info
    brandName: v.string(),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
    // Studio Status
    status: v.optional(v.string()), // "draft", "in_progress", "completed"
    currentStep: v.optional(v.number()), // 1-9 for workflow steps
    // Step 1: Upload & Analysis
    pdfContent: v.optional(v.string()),
    pdfSummary: v.optional(v.string()),
    // Step 2: Visual Style
    visualStyle: v.optional(v.string()), // "3d", "2d", "realistic", "anime"
    // Step 3: Characters
    characters: v.optional(v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      referenceImage: v.optional(v.string()),
      generatedViews: v.optional(v.array(v.string())),
    }))),
    // Step 4: Script
    script: v.optional(v.string()),
    scenes: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      dialogue: v.optional(v.string()),
      characters: v.optional(v.array(v.string())),
      location: v.optional(v.string()),
    }))),
    // Step 5: Generated Assets
    locations: v.optional(v.array(v.object({
      name: v.string(),
      imageUrl: v.string(),
    }))),
    thumbnails: v.optional(v.array(v.object({
      sceneId: v.string(),
      imageUrl: v.string(),
    }))),
    // Step 6: Video Generation
    videoClips: v.optional(v.array(v.object({
      sceneId: v.string(),
      videoUrl: v.string(),
      duration: v.optional(v.number()),
    }))),
    finalVideoUrl: v.optional(v.string()),
    // Progress tracking
    progressLog: v.optional(v.array(v.object({
      step: v.number(),
      action: v.string(),
      status: v.string(),
      timestamp: v.string(),
    }))),
    // Chat messages for studio
    studioMessages: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
      toolCalls: v.optional(v.array(v.object({
        action: v.string(),
        status: v.string(),
      }))),
      timestamp: v.string(),
    }))),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_status", ["status"]),

  // Keep old table name as alias during migration
  onboardings: defineTable({
    userId: v.optional(v.string()),
    brandName: v.string(),
    logo: v.optional(v.string()),
    brandColors: v.optional(v.array(v.string())),
    // Legacy fields - kept for existing data compatibility
    tone: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),

  chatSessions: defineTable({
    campaignId: v.string(),
    title: v.string(),
    createdAt: v.string(),
  }),
  
  messages: defineTable({
    sessionId: v.string(),
    role: v.string(),
    content: v.string(),
    createdAt: v.string(),
  }),

  chats: defineTable({
    sessionId: v.id("chatsessions"),
    role: v.string(),
    content: v.string(),
    image: v.optional(v.object({
      base64: v.string(),
      filename: v.string(),
      mimeType: v.string(),
    })),
    video: v.optional(v.object({
      base64: v.string(),
      filename: v.string(),
      mimeType: v.string(),
    })),
    createdAt: v.string(),
  }).index("by_sessionId", ["sessionId"]),

  // Bluesky Social Posting
  blueskyAccounts: defineTable({
    userId: v.optional(v.string()),
    handle: v.string(),
    did: v.string(),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    connectedAt: v.string(),
  }).index("by_userId", ["userId"]),

  scheduledPosts: defineTable({
    userId: v.optional(v.string()),
    campaignId: v.optional(v.string()),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    hasMedia: v.optional(v.boolean()),
    altText: v.optional(v.string()),
    platform: v.string(),
    status: v.string(),
    scheduledFor: v.optional(v.string()),
    postedAt: v.optional(v.string()),
    postUri: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_status", ["status"]).index("by_platform", ["platform"]),
})