"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/ui/Header"
import Image from "next/image"

const mediaItems = [
  { type: "video", src: "/videos/video2.mp4" },
  { type: "video", src: "/videos/video5.mp4" },
  { type: "video", src: "/videos/video3.mp4" },
  { type: "image", src: "/images/image1.png" },
  { type: "video", src: "/videos/video4.mp4" },
  { type: "video", src: "/videos/video1.mp4" },
  { type: "image", src: "/images/image2.png" },
]

export default function DemoPage() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mediaItems.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const current = mediaItems[index]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header placeholder */}
      <Header />

      {/* Carousel */}
      <div className="flex flex-col items-center justify-center flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-3xl h-[500px] rounded-2xl overflow-hidden shadow-lg"
          >
            {current.type === "image" ? (
              <Image
                src={current.src}
                alt=""
                height={1600}
                width={1600}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={current.src}
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex mt-6 space-x-2">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 hover:cursor-pointer ${
                i === index ? "bg-[#f97316] scale-110" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-400 border-t border-[#1f1f1f]">
        © 2025 <span className="text-[#f97316]">Adverto</span> | Demo Mode
      </footer>
    </div>
  )
}
