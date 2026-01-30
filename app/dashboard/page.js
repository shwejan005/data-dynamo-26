"use client"

import { motion } from "framer-motion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/dashboard/empty-state"
import { PlusCircle, Rocket } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const onboardings = useQuery(api.onboarding.getOnboardings, {})
  const isEmpty = !onboardings || onboardings.length === 0

  if (!onboardings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-gray-400">
        <p>Loading your campaigns...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white relative overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 flex items-center justify-between px-10 py-5 border-b border-white/10 backdrop-blur-md bg-[#101010]/80"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Your Campaigns</h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/onboarding")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-black font-semibold shadow-md hover:shadow-orange-500/30 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          New Campaign
        </motion.button>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-14">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {onboardings.map((brand) => (
              <motion.div
                key={brand._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -6,
                  boxShadow: "0px 0px 25px rgba(255, 140, 0, 0.15)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onClick={() => router.push(`/dashboard/${brand._id}`)}
                className="group relative p-6 rounded-2xl border border-white/10 bg-[#141414]/70 backdrop-blur-sm hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  {brand.logo ? (
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-white/10 shadow-md overflow-hidden">
                      <img
                        src={brand.logo}
                        alt={brand.brandName}
                        className="object-contain w-12 h-12"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-[#1f1f1f] rounded-xl flex items-center justify-center border border-white/10">
                      <Rocket className="w-6 h-6 text-orange-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-orange-400 transition-colors">
                      {brand.brandName}
                    </h3>
                  </div>
                </div>

                {/* Brand Colors */}
                {brand.brandColors && brand.brandColors.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {brand.brandColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Created {new Date(brand.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}