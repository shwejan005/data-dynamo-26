"use client"

import { motion } from "framer-motion"

export function ConfirmStep({ formData }) {
  return (
    <motion.div
      key="confirm-step"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 text-white bg-gray-500/10 p-6"
    >
      <h2 className="text-2xl font-semibold text-[#f97316]">Confirm your details</h2>

      <div className="space-y-3">
        <p><span className="text-[#f97316]">Brand:</span> {formData.brandName || "Not provided"}</p>
        <p><span className="text-[#f97316]">Tone:</span> {formData.tone || "Not selected"}</p>
        <p>
          <span className="text-[#f97316]">Platforms:</span>{" "}
          {formData.platforms.length ? formData.platforms.join(", ") : "None selected"}
        </p>
      </div>

      {formData.logo && (
        <div>
          <span className="text-[#f97316]">Logo Preview:</span>
          <img
            src={URL.createObjectURL(formData.logo)}
            alt="logo preview"
            className="mt-3 w-24 h-24 object-contain border border-[#f97316] rounded-lg"
          />
        </div>
      )}
    </motion.div>
  )
}
