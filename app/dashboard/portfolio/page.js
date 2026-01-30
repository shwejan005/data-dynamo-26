"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export default function PortfolioPage() {
  const userStats = useQuery(api.portfolio.getUserStats)
  const allCampaigns = useQuery(api.portfolio.getAllCampaigns)
  const mediaGenerations = useQuery(api.portfolio.getVideoGenerations)

  const ORANGE = "#f97316"

  const defaultUser = {
    name: "AI Video Studio",
    username: "@creator",
    campaignsCreated: 0,
    totalGenerations: 0,
    completedCampaigns: 0,
    draftCampaigns: 0,
    joinedAt: "Recently",
  }

  const user = userStats ? { ...defaultUser, ...userStats } : defaultUser

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-400"
      case "draft": return "text-yellow-400"
      case "in_progress": return "text-blue-400"
      default: return "text-gray-400"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return "✅"
      case "draft": return "⏳"
      default: return "✨"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-gray-800 pb-6"
        >
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.username}</p>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-300">
            <div>
              <span className="text-[#f97316] font-semibold">{user.campaignsCreated}</span> Campaigns
            </div>
            <div>
              <span className="text-[#f97316] font-semibold">{user.totalGenerations}</span> Generations
            </div>
            <div>
              <span className="text-green-400 font-semibold">{user.completedCampaigns}</span> Completed
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">{user.draftCampaigns}</span> Drafts
            </div>
            <div className="text-gray-500">Joined {user.joinedAt}</div>
          </div>
        </motion.div>

        {/* Generated Media Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold mb-6 flex items-center gap-2"
          >
            <span>🎬</span>
            <span>Generated Media</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {mediaGenerations?.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-[#f97316] transition group"
              >
                <div className="aspect-video relative bg-gray-900">
                  {item.mediaUrl && (
                    item.isVideo ? (
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        src={item.mediaUrl}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.brandName}
                        className="object-cover w-full h-full"
                      />
                    )
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-black/60 ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status || "draft"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{item.brandName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="px-2 py-0.5 bg-gray-800 rounded">{item.visualStyle || "N/A"}</span>
                    <span>•</span>
                    <span>Step {item.currentStep || 1}/7</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {(!mediaGenerations || mediaGenerations.length === 0) && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🎬</div>
                <p>No media generated yet.</p>
                <p className="text-sm mt-1">Complete a studio workflow to see your generations here.</p>
              </div>
            )}
          </div>
        </section>

        {/* All Campaigns Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-semibold mb-6 flex items-center gap-2"
          >
            <span>✨</span>
            <span>All Campaigns</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCampaigns?.map((campaign, i) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="p-4 bg-zinc-900 rounded-xl border border-gray-800 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{campaign.brandName}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    {campaign.status || "draft"}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {campaign.visualStyle && (
                    <span className="px-2 py-1 bg-gray-800 rounded">{campaign.visualStyle}</span>
                  )}
                  <span className="px-2 py-1 bg-gray-800 rounded">Step {campaign.currentStep || 1}/7</span>
                  {campaign.hasMedia && (
                    <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded flex items-center gap-1">
                      🖼️ Media
                    </span>
                  )}
                  {campaign.charactersCount > 0 && (
                    <span className="px-2 py-1 bg-gray-800 rounded">{campaign.charactersCount} chars</span>
                  )}
                  {campaign.scenesCount > 0 && (
                    <span className="px-2 py-1 bg-gray-800 rounded">{campaign.scenesCount} scenes</span>
                  )}
                </div>
              </motion.div>
            ))}
            {(!allCampaigns || allCampaigns.length === 0) && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">✨</div>
                <p>No campaigns yet.</p>
                <p className="text-sm mt-1">Start a new project in the Studio to begin.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
