"use client"

import { motion } from "framer-motion"

const platforms = ["Instagram", "YouTube", "Twitter", "LinkedIn", "Facebook"]

export function PlatformsStep({ value, onChange }) {
  const togglePlatform = (platform) => {
    if (value.includes(platform)) onChange(value.filter((p) => p !== platform))
    else onChange([...value, platform])
  }

  return (
    <motion.div
      key="platforms-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 text-white"
    >
      <h2 className="text-2xl font-semibold text-[#f97316]">Select your platforms</h2>
      <p className="text-gray-400">Where do you want to run your campaigns?</p>

      <div className="flex flex-wrap gap-3 mt-4">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={`px-4 py-2 rounded-lg border hover:cursor-pointer ${
              value.includes(p)
                ? "bg-[#f97316] text-black border-[#f97316]"
                : "border-gray-600 text-white hover:border-[#f97316]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
