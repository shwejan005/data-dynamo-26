"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const steps = [
  { number: "01", title: "Create", description: "Define your campaign and creative requirements" },
  { number: "02", title: "Generate", description: "AI generates multiple creative variations" },
  { number: "03", title: "Review", description: "Collaborate and approve with your team" },
  { number: "04", title: "Publish", description: "Automatically deploy across all platforms" },
]

export function Workflow() {
  return (
    <section id="workflow" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Simple Workflow</h2>
          <p className="text-white/60 text-lg">From concept to publication in minutes</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4 md:gap-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm h-full flex flex-col justify-between">
                <div>
                  <motion.div whileHover={{ scale: 1.1 }} className="text-4xl font-bold text-white/30 mb-4">
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/60 text-sm">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10"
                >
                  <ArrowRight size={24} className="text-white/30" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
