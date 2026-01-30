"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import { Pencil, Trash2, MessageSquarePlus, Video } from "lucide-react"
import { useState } from "react"

export default function DashboardDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const campaign = useQuery(api.onboarding.getOnboardingById, { id })
  const deleteOnboarding = useMutation(api.onboarding.deleteOnboarding)
  const updateOnboarding = useMutation(api.onboarding.updateOnboarding)
  const createSession = useMutation(api.chats.createSession)
  const sessions = useQuery(api.chats.getSessionsByCampaign, { campaignId: id })

  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-gray-500">
        Loading campaign details...
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteOnboarding({ id })
    router.push("/dashboard")
  }

  const handleNewChat = async () => {
    const title = prompt("Enter a title for your chat:", "New conversation")
    if (!title) return
    const chatId = await createSession({ campaignId: id, title })
    router.push(`/dashboard/${id}/chat/${chatId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#141414] text-white flex flex-col"
    >
      {/* Top context bar */}
      <div className="bg-[#f97316] text-black text-xs px-6 py-2 flex justify-between items-center border-b border-[#1a1a1a] font-medium">
        <div className="flex items-center gap-6">
          <span>{campaign.brandName}</span>
          {campaign.brandColors && campaign.brandColors.length > 0 && (
            <div className="flex items-center gap-1">
              {campaign.brandColors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-black/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
          <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/studio?campaign=${id}`)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-black/10 hover:bg-black/20 hover:cursor-pointer transition-all"
          >
            <Video size={14} />
            Studio
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-black/10 hover:bg-black/20 hover:cursor-pointer transition-all text-red-700"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* 🧡 Delete confirmation modal */}
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-xl text-center"
          >
            <p className="text-gray-300 mb-4 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-orange-400 font-semibold">{campaign.brandName}</span>?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-black rounded-lg font-medium hover:opacity-90 hover:cursor-pointer"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-[#222] text-gray-300 rounded-lg border border-[#333] hover:bg-[#333] hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 🧭 Main Content */}
      <div className="flex flex-col items-center justify-between flex-grow px-4 pb-10">
        <div className="text-center mt-20 mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-5xl font-extrabold tracking-tight mb-3"
          >
            Adverto
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 max-w-md mx-auto text-sm"
          >
            Manage your campaign and start chats for AI-driven ideas and optimizations.
          </motion.p>
        </div>

        {/* 🧩 Active chats */}
        <div className="w-full max-w-2xl flex flex-col bg-[#141414] rounded-2xl border border-[#1f1f1f] shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#1f1f1f] flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chat Sessions</h2>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-black font-medium hover:opacity-90 hover:cursor-pointer transition-all"
            >
              <MessageSquarePlus size={16} />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 p-4 space-y-2">
            {sessions ? (
              sessions.length > 0 ? (
                sessions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => router.push(`/dashboard/${id}/chat/${s._id}`)}
                    className="w-full text-left px-4 py-3 rounded-md bg-[#1b1b1b] hover:bg-[#1f1f1f] hover:cursor-pointer border border-[#2a2a2a] text-sm text-gray-300 hover:border-orange-500/50 transition-all"
                  >
                    <div className="font-medium text-white truncate">{s.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm px-4 py-8 text-center">
                  No chats yet. Create one to begin your campaign discussion.
                </p>
              )
            ) : (
              <p className="text-gray-500 text-sm px-4 py-8 text-center">
                Loading chat sessions...
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}