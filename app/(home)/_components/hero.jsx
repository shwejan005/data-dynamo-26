"use client";

import { SignedOut } from "@clerk/nextjs"; 
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Animated background elements */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"
      />

      {/* Hero content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-mono text-sm uppercase tracking-widest text-white/50">
            AI-Powered Creative Platform
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-6 text-6xl font-bold leading-tight text-white md:text-7xl"
        >
          Generate, Edit & Automate
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="block text-white/60"
          >
            Ad Creatives at Scale
          </motion.span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-white/70"
        >
          A unified AI-powered platform where businesses instantly generate, edit, approve, and automate ad creatives
          across multiple social platforms.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4"
        >
          <SignedOut>
            <Link href="/sign-in"  className="flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-white/90 cursor:pointer">
                Start Free Trial
                <ArrowRight size={18} />
          </Link>
          </SignedOut>

          <Link href="/demo" className="rounded-full border border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:border-white/50 cursor:pointer">
              Watch Demo
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}