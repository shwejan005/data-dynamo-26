"use client"

import { motion } from "framer-motion"

const tones = ["Professional", "Friendly", "Playful", "Bold", "Minimal"]

export function ToneStep({ value, onChange }) {
  return (
    <motion.div
      key="tone-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 text-white"
    >
      <h2 className="text-2xl font-semibold text-[#f97316]">Choose your brand tone</h2>
      <p className="text-gray-400">Select one that best describes your communication style</p>

      <div className="flex flex-wrap gap-3 mt-4">
        {tones.map((tone) => (
          <button
            key={tone}
            onClick={() => onChange(tone)}
            className={`px-4 py-2 rounded-lg border hover:cursor-pointer ${
              value === tone
                ? "bg-[#f97316] text-black border-[#f97316]"
                : "border-gray-600 text-white hover:border-[#f97316]"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
