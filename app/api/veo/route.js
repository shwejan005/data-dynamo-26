export async function POST(req) {
  console.log("\n==============================")
  console.log("🖼 STABILITY IMAGE ROUTE HIT")
  console.log("==============================")

  try {
    const body = await req.json()
    console.log("📦 Incoming body:", body)

    const { prompt } = body
    console.log("📝 Prompt:", prompt)

    // ✅ Native FormData (NO IMPORT)
    const form = new FormData()

    form.append("prompt", prompt)
    form.append("model", "sd3.5-large")
    form.append("output_format", "png")

    console.log("📡 Calling Stability API...")

    const res = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "application/json"
          // ❌ DO NOT SET CONTENT-TYPE
        },
        body: form
      }
    )

    console.log("📊 Stability Status:", res.status)

    const data = await res.json()

    console.log("📥 Stability Response:", JSON.stringify(data, null, 2))

    return Response.json(data)

  } catch (err) {
    console.error("🔥 STABILITY ERROR:", err)

    return Response.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
