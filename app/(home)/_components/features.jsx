"use client";

import { motion } from "framer-motion";
import { FileText, Palette, Film, Share2, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Script Generator",
    description: "One agent generates marketing scripts and captions from simple inputs like product details or brand guidelines.",
  },
  {
    icon: Palette,
    title: "Ad Creative Engine",
    description: "Another agent creates images and ad creatives automatically, maintaining consistent branding across all assets.",
  },
  {
    icon: Film,
    title: "Video Generation",
    description: "Generate short marketing videos with AI. From product demos to promotional content in minutes.",
  },
  {
    icon: Share2,
    title: "Auto-Publish Workflows",
    description: "Automation workflows publish content across platforms like social media and e-commerce channels.",
  },
];

export function Features() {
  return (
    <section className="relative py-32 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
      
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 mb-6">
            <Zap size={14} className="text-orange-400" />
            <span className="text-sm font-medium text-orange-400">AI Agents Working Together</span>
          </div>
          <h2 className="text-4xl font-bold text-white sm:text-5xl mb-4">
            Intelligent Marketing System
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Multiple AI agents collaborate to generate, create, and publish your marketing content automatically.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-orange-500/30 hover:bg-white/[0.07] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <feature.icon size={24} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits for Smart Retail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">For Smart Retail</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Faster Promotions",
              "Personalized Marketing",
              "Reduced Costs",
              "Better Performance",
            ].map((benefit) => (
              <div
                key={benefit}
                className="p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <span className="text-gray-300 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-orange-500/25"
          >
            Start Automating
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
