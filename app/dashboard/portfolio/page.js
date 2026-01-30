"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export default function PortfolioPage() {
  const userStats = useQuery(api.portfolio.getUserStats)
  const videoGenerations = useQuery(api.portfolio.getVideoGenerations)
  const imageGenerations = useQuery(api.portfolio.getImageGenerations)

  const defaultUser = {
    name: "Sai Kshitish",
    username: "@saikshitish",
    campaignsCreated: 0,
    totalGenerations: 0,
    joinedAt: "March 2024",
  }

  const user = userStats ? { ...defaultUser, ...userStats } : defaultUser

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-b border-gray-800 pb-6"
        >
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.username}</p>

          <div className="mt-6 flex gap-6 text-sm text-gray-300">
            <div>
              <span className="text-[#f97316] font-semibold">{user.campaignsCreated}</span> Campaigns
            </div>
            <div>
              <span className="text-[#f97316] font-semibold">{user.totalGenerations}</span> Generations
            </div>
            <div>Joined {user.joinedAt}</div>
          </div>
        </motion.div>

        {/* Video Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold mb-6 text-[#f97316]"
          >
            Video Generations
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videoGenerations?.map((video, i) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-[#f97316] transition"
              >
                <div className="aspect-video relative">
                  <video
                    autoPlay
                    muted
                    loop
                    src={video.video ? `data:${video.video.mimeType};base64,${video.video.base64}` : ""}
                    className="object-cover opacity-90 hover:opacity-100 transition w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{video.role}</h3>
                  <p className="text-sm text-gray-400 truncate">{video.content}</p>
                </div>
              </motion.div>
            ))}
            {(!videoGenerations || videoGenerations.length === 0) && (
              <div className="text-gray-500">No videos generated yet.</div>
            )}
          </div>
        </section>

        {/* Image Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-semibold mb-6 text-[#f97316]"
          >
             Image Generations
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {imageGenerations?.map((image, i) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-[#f97316] transition"
              >
                <div className="aspect-square relative">
                  {image.image && (
                    <Image
                    src={`data:${image.image.mimeType};base64,${image.image.base64}`}
                    alt="Generated Content"
                    fill
                    className="object-cover opacity-90 hover:opacity-100 transition"
                  />
                  )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{image.role}</h3>
                    <p className="text-sm text-gray-400 truncate">{image.content}</p>
                </div>
              </motion.div>
            ))}
            {(!imageGenerations || imageGenerations.length === 0) && (
                <div className="text-gray-500">No images generated yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
