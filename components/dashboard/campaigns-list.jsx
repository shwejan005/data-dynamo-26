"use client"

import { motion } from "framer-motion"

export function CampaignsList({ campaigns }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-black text-white"
      case "draft":
        return "bg-gray-200 text-black"
      case "paused":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-black"
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
      {campaigns.map((campaign) => (
        <motion.div
          key={campaign.id}
          variants={item}
          className="p-6 border border-border rounded-lg hover:shadow-lg transition-shadow bg-white cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-black mb-1">{campaign.name}</h3>
              <p className="text-gray-600 text-sm">{campaign.description}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(campaign.status)}`}
            >
              {campaign.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-gray-500 mb-1">Goal</p>
              <p className="text-sm font-medium text-black">{campaign.goal}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Platforms</p>
              <p className="text-sm font-medium text-black">{campaign.platform}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-medium text-black">{campaign.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
