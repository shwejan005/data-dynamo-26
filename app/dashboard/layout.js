"use client"

import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, FolderOpen, Search, User, Share2, Video } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DashboardLayout({ children }) {
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false)
  const campaigns = useQuery(api.onboarding.getOnboardings, {})

  const navItems = [
    { name: "Campaigns", icon: FolderOpen, href: "/dashboard" },
    { name: "Studio", icon: Video, href: "/dashboard/studio" },
    { name: "Social", icon: Share2, href: "/dashboard/social" },
    { name: "Statistics", icon: BarChart3, href: "/dashboard/statistics" },
    { name: "Portfolio", icon: User, href: "/dashboard/portfolio" },
  ]

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 flex flex-col items-center py-6 border-r border-neutral-800 relative"
      >
        <Link href={'/'} className="text-2xl font-bold mb-8 tracking-tight text-orange-400">✴</Link>

        <nav className="flex flex-col gap-8">
          {navItems.map((item) => {
            if (item.name === "Campaigns") {
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setIsCampaignsOpen(true)}
                  onMouseLeave={() => setIsCampaignsOpen(false)}
                  className="flex flex-col items-center group relative"
                >
                  <Link href={item.href} className="flex flex-col items-center">
                    <item.icon className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" />
                    <span className="text-xs mt-1 text-gray-500 group-hover:text-orange-400">
                      {item.name}
                    </span>
                  </Link>

                  {/* Dynamic Campaigns Hover Panel */}
                  <AnimatePresence>
                    {isCampaignsOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-0 left-full ml-4 w-56 bg-[#1a1a1a]/95 border border-neutral-700 rounded-xl p-4 shadow-lg z-50"
                      >
                        <h3 className="text-sm font-semibold text-orange-400 mb-3">
                          Latest Campaigns
                        </h3>
                        <ul className="space-y-2">
                          {campaigns === undefined ? (
                            <li className="text-xs text-gray-400">Loading…</li>
                          ) : campaigns.length === 0 ? (
                            <li className="text-xs text-gray-500">No campaigns yet</li>
                          ) : (
                            campaigns.slice(0, 3).map((c) => (
                              <Link
                                key={c._id}
                                href={`/dashboard/${c._id}`}
                                className="block text-xs text-gray-300 hover:text-orange-400 transition"
                              >
                                <div className="font-medium truncate">{c.brandName}</div>
                                <div className="text-[10px] text-gray-500">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </div>
                              </Link>
                            ))
                          )}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center group"
              >
                <item.icon className="w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-colors" />
                <span className="text-xs mt-1 text-gray-500 group-hover:text-orange-400">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}