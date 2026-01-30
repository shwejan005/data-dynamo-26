"use client"

import { useState } from "react"

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [imageBase64, setImageBase64] = useState(null)

  async function generateImage() {
    console.log("\n======================")
    console.log("🖼 IMAGE GENERATE CLICKED")
    console.log("======================")

    setLoading(true)

    try {
      console.log("📡 Calling backend...")

      const res = await fetch("/api/veo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt:
            "Ultra realistic man eating french fries"
        })
      })

      console.log("📊 HTTP Status:", res.status)

      const data = await res.json()
      console.log("📥 Backend Response:", data)

      if (data?.image) {
        setImageBase64(data.image)
      }

      // Some responses return array format
      if (data?.artifacts?.[0]?.base64) {
        setImageBase64(data.artifacts[0].base64)
      }

    } catch (err) {
      console.error("🔥 FRONTEND ERROR:", err)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Stable Diffusion 3.5 Test</h1>

      <button
        onClick={generateImage}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: 16
        }}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {imageBase64 && (
        <div style={{ marginTop: 30 }}>
          <h3>Generated Image</h3>

          <img
            src={`data:image/png;base64,${imageBase64}`}
            style={{
              width: 400,
              borderRadius: 10
            }}
          />
        </div>
      )}
    </div>
  )
}
