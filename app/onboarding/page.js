"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/ui/Header"
import { Upload, X, Plus, ArrowRight, Loader2 } from "lucide-react"

const PRESET_COLORS = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
]

export default function OnboardingPage() {
  const router = useRouter()
  const saveOnboarding = useMutation(api.onboarding.saveOnboarding)
  const generateUploadUrl = useMutation(api.onboarding.generateUploadUrl)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brandName: "",
    logo: null,
    logoPreview: "",
    brandColors: [],
    duration: 30, // Default duration
  })

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file),
      }))
    }
  }

  const removeLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
      logoPreview: "",
    }))
  }

  const toggleColor = (color) => {
    setFormData((prev) => {
      const exists = prev.brandColors.includes(color)
      if (exists) {
        return { ...prev, brandColors: prev.brandColors.filter((c) => c !== color) }
      } else if (prev.brandColors.length < 5) {
        return { ...prev, brandColors: [...prev.brandColors, color] }
      }
      return prev
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.brandName.trim()) return

    setLoading(true)
    try {
      let logoStorageId = null

      if (formData.logo instanceof File) {
        const postUrl = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": formData.logo.type },
          body: formData.logo,
        })
        const { storageId } = await result.json()
        logoStorageId = storageId
      }

      const campaignId = await saveOnboarding({
        brandName: formData.brandName,
        logo: logoStorageId || undefined,
        brandColors: formData.brandColors.length > 0 ? formData.brandColors : undefined,
        duration: formData.duration,
      })

      router.push(`/dashboard/studio?campaign=${campaignId}`)
    } catch (error) {
      console.error("Failed to save campaign:", error)
      alert("Failed to create campaign. Please try again.")
      setLoading(false)
    }
  }

  const canSubmit = formData.brandName.trim().length > 0

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Create Campaign</h1>
            <p className="text-gray-400">Set up your brand to start creating AI-powered content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder="Enter your brand name"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo <span className="text-gray-500">(optional)</span>
              </label>
              {formData.logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={formData.logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Upload size={24} className="text-gray-500" />
                </label>
              )}
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Duration <span className="text-orange-500">*</span>
              </label>
              <div className="flex gap-3">
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: d }))}
                    className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-all ${
                      formData.duration === d
                        ? "bg-orange-500 text-black border-orange-500"
                        : "bg-[#1a1a1a] text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand Colors <span className="text-gray-500">(optional, select up to 5)</span>
              </label>
              
              {/* Preset colors */}
              <div className="flex flex-wrap gap-3 mb-4">
                {PRESET_COLORS.map((color) => {
                  const isSelected = formData.brandColors.includes(color)
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                })}
              </div>

              {/* Custom color input */}
              <div className="flex gap-3">
                <div className="flex-1 flex gap-2">
                  <input
                    type="color"
                    id="colorPicker"
                    className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    onChange={(e) => {
                      const hex = e.target.value
                      if (!formData.brandColors.includes(hex) && formData.brandColors.length < 5) {
                        setFormData((prev) => ({ ...prev, brandColors: [...prev.brandColors, hex] }))
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    maxLength={7}
                    className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const hex = e.target.value.trim()
                        if (/^#[0-9A-Fa-f]{6}$/.test(hex) && !formData.brandColors.includes(hex) && formData.brandColors.length < 5) {
                          setFormData((prev) => ({ ...prev, brandColors: [...prev.brandColors, hex] }))
                          e.target.value = ""
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="#000000"]')
                      const hex = input?.value.trim()
                      if (/^#[0-9A-Fa-f]{6}$/.test(hex) && !formData.brandColors.includes(hex) && formData.brandColors.length < 5) {
                        setFormData((prev) => ({ ...prev, brandColors: [...prev.brandColors, hex] }))
                        input.value = ""
                      }
                    }}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected colors */}
              {formData.brandColors.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Selected colors:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.brandColors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 rounded-lg"
                      >
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-400 font-mono">{color}</span>
                        <button
                          type="button"
                          onClick={() => toggleColor(color)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Campaign
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}