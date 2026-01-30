"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function CampaignLayout({ children }) {
  const { id } = useParams()
  const router = useRouter()
  const sessions = useQuery(api.chats.getSessionsByCampaign, { campaignId: id })
  const createSession = useMutation(api.chats.createSession)

  const handleNewChat = async () => {
    const title = prompt("Enter chat title:", "New chat")
    if (!title) return
    const newId = await createSession({ campaignId: id, title })
    router.push(`/dashboard/${id}/chat/${newId}`)
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 border-r border-white/10 flex flex-col bg-[#0e0e0e]"
      >
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions ? (
            sessions.length > 0 ? (
              sessions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => router.push(`/dashboard/${id}/chat/${s._id}`)}
                  className="w-full text-left px-4 py-2 rounded-md hover:bg-[#1a1a1a] hover:cursor-pointer text-sm transition-colors truncate"
                >
                  {s.title}
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-xs p-4">No chats yet</p>
            )
          ) : (
            <p className="text-gray-600 text-xs p-4">Loading...</p>
          )}
        </div>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-orange-500 text-black rounded-md hover:bg-orange-600 hover:cursor-pointer"
          >
            <Plus size={14} /> New Chat
          </button>
        </div>
      </motion.aside>

      {/* Chat view */}
      <main className="flex-1">{children}</main>
    </div>
  )
}