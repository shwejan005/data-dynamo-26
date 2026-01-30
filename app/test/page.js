"use client"

import { useState } from "react"

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function pollOperation(operationName) {
    console.log("\n🔄 START POLLING:", operationName)

    while (true) {
      console.log("📡 Polling backend...")

      const res = await fetch("/api/veo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "status",
          operationName
        })
      })

      console.log("📊 Poll HTTP Status:", res.status)

      const data = await res.json()
      console.log("📥 Poll Data:", data)

      if (data.done) {
        console.log("✅ VIDEO GENERATION DONE")
        return data
      }

      console.log("⏳ Waiting 5s before next poll...")
      await new Promise(r => setTimeout(r, 5000))
    }
  }

  async function generateVideo() {
    console.log("\n======================")
    console.log("🎬 GENERATE BUTTON CLICKED")
    console.log("======================")

    setLoading(true)

    try {
      console.log("📡 Calling backend generate...")

      const res = await fetch("/api/veo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          prompt: "cinematic ocean sunset drone shot realistic lighting"
        })
      })

      console.log("📊 Generate HTTP Status:", res.status)

      const data = await res.json()
      console.log("📥 Generate Response:", data)

      const operationName = data.name
      console.log("🆔 Operation Name:", operationName)

      const finalResult = await pollOperation(operationName)

      console.log("🏁 FINAL RESULT:", finalResult)

      setResult(finalResult)

    } catch (err) {
      console.error("🔥 FRONTEND ERROR:", err)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Veo Test</h1>

      <button onClick={generateVideo} disabled={loading}>
        {loading ? "Generating..." : "Generate Video"}
      </button>

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
