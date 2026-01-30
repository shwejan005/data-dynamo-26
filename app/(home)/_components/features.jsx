"use client"

import { motion } from "framer-motion"
import { Zap, Users, BarChart3, Cpu } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "AI-Powered Generation",
    description: "Generate images, videos, and captions instantly using AI models optimized for ad performance.",
  },
  {
    icon: Users,
    title: "Collaborative Workflows",
    description: "Enable real-time feedback, versioning, and multi-user approvals to streamline creative review.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Leverage analytics-driven insights to refine creatives and improve engagement metrics.",
  },
  {
    icon: Cpu,
    title: "Automated Publishing",
    description: "Automatically publish approved creatives across platforms with scheduled timing and formatting.",
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to create, manage, and scale your ad campaigns
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(255,255,255,0.1)" }}
                className="p-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-4 inline-block p-3 bg-white/10 rounded-lg"
                >
                  <Icon size={24} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
