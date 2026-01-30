"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"

const PRESET_COLORS = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#000000", // Black
  "#ffffff", // White
]

export function ColorsStep({ value = [], onChange }) {
  const [customColor, setCustomColor] = useState("#f97316")

  const addColor = (color) => {
    if (!value.includes(color) && value.length < 5) {
      onChange([...value, color])
    }
  }

  const removeColor = (color) => {
    onChange(value.filter((c) => c !== color))
  }

  return (
    <div className="text-white">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-2"
      >
        Brand Colors
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 mb-8"
      >
        Select up to 5 colors that represent your brand.
      </motion.p>

      {/* Selected Colors */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Selected Colors ({value.length}/5)
        </label>
        <div className="flex flex-wrap gap-3">
          {value.map((color, idx) => (
            <motion.div
              key={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative group"
            >
              <div
                className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={() => removeColor(color)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
              >
                <X size={12} />
              </button>
              <span className="block text-xs text-gray-500 text-center mt-1">
                {color}
              </span>
            </motion.div>
          ))}
          {value.length === 0 && (
            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500">
              <Plus size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Preset Colors */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Preset Colors
        </label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => addColor(color)}
              disabled={value.includes(color) || value.length >= 5}
              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 hover:cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                value.includes(color) ? "border-orange-500" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Custom Color
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="#000000"
          />
          <button
            onClick={() => addColor(customColor)}
            disabled={value.includes(customColor) || value.length >= 5}
            className="px-4 py-3 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 hover:cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
