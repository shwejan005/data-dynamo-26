"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <motion.div
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
        className="absolute inset-0 bg-white/5 rounded-full blur-3xl"
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to Transform Your Ad Creation?</h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Join leading brands using Gen to create, manage, and scale their ad campaigns with AI.
          </p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-white/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-white/30 text-white rounded-full font-semibold text-lg hover:border-white/50 transition-colors"
            >
              Schedule Demo
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm mt-8"
          >
            No credit card required. Start creating in minutes.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
