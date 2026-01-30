"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FolderOpen } from "lucide-react"

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center text-white"
    >
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
          <FolderOpen size={36} className="text-black" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No campaigns yet</h2>
        <p className="text-gray-400 mb-8">Create your first campaign to get started with AI-powered marketing</p>
      </div>

      <Link
        href="/onboarding"
        className="px-8 py-3 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors font-semibold"
      >
        Create Your First Campaign
      </Link>
    </motion.div>
  )
}