"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { motion } from "framer-motion"
import { SendHorizonal, ArrowLeft, X } from "lucide-react"
import Link from "next/link"

export default function ChatSessionPage() {
  const { id, sessionId } = useParams()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

  const campaign = useQuery(api.onboarding.getOnboardingById, { id })
  const session = useQuery(api.chats.getSessionById, { sessionId })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)
    setError("")

    // Add user message to chat immediately
    const newMessages = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)

    try {
      // Prepare conversation history for the webhook
      const history = newMessages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content.text
      }))

      // Send to AI webhook with history
      const res = await fetch(
        "https://voidflow.app.n8n.cloud/webhook/ad-bot-webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message: userMessage,
            history: history
          }),
        }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || `Request failed with status ${res.status}`)
      }

      const data = await res.json()
      
      // Extract the message and image from the response
      let assistantMessage = ''
      let imageData = null

      // Check if response contains an image
      if (data.status === 'complete' && data.type === 'image' && data.image) {
        assistantMessage = data.message
        imageData = data.image
      } else if (data.message) {
        assistantMessage = data.message
      } else if (data.output) {
        assistantMessage = data.output
      } else if (typeof data === 'string') {
        assistantMessage = data
      } else {
        assistantMessage = "I'm here to help with your campaign."
      }

      // Add assistant response with optional image
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        image: imageData
      }])

    } catch (err) {
      console.error(err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      // Remove the user message we optimistically added if request failed
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  if (!session || !campaign)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-[#0b0b0b]">
        Loading chat...
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col bg-[#0b0b0b] text-white"
    >
      {/* 🧭 Top bar */}
      <div className="bg-[#f97316] text-black text-xs px-6 py-2 flex justify-between items-center border-b border-[#1a1a1a] font-medium">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${id}`} className="hover:underline flex items-center gap-1">
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="text-black/70">|</span>
          <span>{campaign.brandName}</span>
          <span>• {session.title}</span>
        </div>
        <span>{new Date(session.createdAt).toLocaleString()}</span>
      </div>

      {/* 💬 Chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#0b0b0b]"
      >
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-black"
                    : "bg-[#161616] text-gray-200 border border-[#222]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* Display image if present */}
                {msg.image && (
                  <div className="mt-3">
                    <img 
                      src={`data:${msg.image.mimeType};base64,${msg.image.base64}`}
                      alt={msg.image.filename || "Generated image"}
                      className="max-w-full rounded-lg shadow-lg"
                    />
                    <a
                      href={`data:${msg.image.mimeType};base64,${msg.image.base64}`}
                      download={msg.image.filename || "image.png"}
                      className="text-xs text-orange-400 hover:text-orange-300 hover:underline mt-2 inline-block"
                    >
                      📥 Download {msg.image.filename || "image.png"}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-20">
            No messages yet. Start chatting below
          </p>
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] px-4 py-3 rounded-2xl text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg flex items-start justify-between"
        >
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-200 hover:cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* 🧡 Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-[#1f1f1f] bg-[#121212] flex items-center px-4 py-3 space-x-2"
      >
        <input
          type="text"
          placeholder="Ask something about your campaign..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-grow rounded-full bg-[#1e1e1e] text-white placeholder-gray-400 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#f97316] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          disabled={loading || !input.trim()}
          type="submit"
          className="p-3 rounded-full bg-gradient-to-r from-[#f97316] to-[#ffb547] text-black shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendHorizonal className="w-5 h-5" />
        </motion.button>
      </form>
    </motion.div>
  )
}