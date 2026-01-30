"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-b-orange-200/30"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white hover:text-neutral-300 transition-colors"
          >
            Adverto
          </Link>
        </motion.div>

        <div className="flex gap-8 items-center">
          <SignedOut>
            <motion.div className="flex gap-6 items-center">
              <motion.a
                href="#features"
                whileHover={{ color: "#999" }}
                className="text-white/70 hover:text-white transition-colors"
              >
                Features
              </motion.a>
              <motion.a
                href="#workflow"
                whileHover={{ color: "#999" }}
                className="text-white/70 hover:text-white transition-colors"
              >
                Workflow
              </motion.a>
              <Link
                href="/sign-in"
                className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </SignedOut>

          <SignedIn>
            <motion.div className="flex gap-6 items-center">
              <Link
                href="/dashboard"
                className="text-white/80 hover:text-white transition-colors"
              >
                Dashboard
              </Link>

              <Link
                href="/onboarding"
                className="text-white/80 hover:text-white transition-colors"
              >
                Create Campaign
              </Link>

              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "w-9 h-9 rounded-full border border-white/20 hover:border-white transition-all",
                  },
                }}
              />
            </motion.div>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}