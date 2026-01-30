"use client"

import { motion } from "framer-motion"

export function LogoStep({ value, onChange }) {
  return (
    <motion.div
      key="logo-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 text-white"
    >
      <h2 className="text-2xl font-semibold text-[#f97316]">Upload your brand logo</h2>
      <p className="text-gray-400">Optional — helps personalize visuals for your campaigns.</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0])}
        className="bg-black text-white border border-[#f97316] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f97316]"
      />

      {value && (
        <img
          src={URL.createObjectURL(value)}
          alt="logo preview"
          className="mt-4 w-24 h-24 object-contain border border-[#f97316] rounded-lg"
        />
      )}
    </motion.div>
  )
}
