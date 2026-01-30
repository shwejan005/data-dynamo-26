"use client"

import { motion } from "framer-motion"

export function BrandStep({ value, onChange }) {
  return (
    <motion.div
      key="brand-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 text-white"
    >
      <h2 className="text-2xl font-semibold text-[#f97316]">What’s your brand name?</h2>
      <p className="text-gray-400">This helps us tailor ads specifically for your brand</p>

      <label className="text-sm text-gray-400">Brand Name</label>
      <input
        type="text"
        placeholder="Enter your brand name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black text-white border border-[#f97316] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f97316]"
      />

      <p className="text-sm text-gray-500 mt-2">Examples: Nike, TechCorp, LocalBakery</p>
    </motion.div>
  )
}
