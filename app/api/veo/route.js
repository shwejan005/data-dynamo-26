import { GoogleAuth } from "google-auth-library"

export async function POST(req) {
  console.log("\n==============================")
  console.log("🚀 VEO API ROUTE HIT")
  console.log("==============================")

  try {
    const body = await req.json()
    console.log("📦 Incoming Body:", body)

    const { mode } = body
    console.log("⚙️ Mode:", mode)

    console.log("🔐 Creating Google Auth...")
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/cloud-platform"
    })

    console.log("🔑 Getting auth client...")
    const client = await auth.getClient()

    console.log("🎫 Getting access token...")
    const accessToken = await client.getAccessToken()

    if (!accessToken?.token) {
      console.error("❌ NO ACCESS TOKEN")
      throw new Error("Failed to generate access token")
    }

    console.log("✅ Access Token OK")

    const projectId = process.env.GOOGLE_PROJECT_ID
    const region = process.env.GOOGLE_REGION

    console.log("📁 Project ID:", projectId)
    console.log("🌍 Region:", region)

    // ================= GENERATE =================
    if (mode === "generate") {
      console.log("\n🎬 GENERATE VIDEO START")

      const { prompt } = body
      console.log("📝 Prompt:", prompt)

      const endpoint =
        `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/veo-3.0-generate-001:predictLongRunning`

      console.log("📡 Endpoint:", endpoint)

      const start = Date.now()

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { durationSeconds: 5 }
        })
      })

      console.log("📊 Vertex Status:", res.status)

      const data = await res.json()

      console.log("📥 Vertex Response:", JSON.stringify(data, null, 2))
      console.log("⏱ Request Time:", Date.now() - start, "ms")

      console.log("🎬 GENERATE VIDEO END\n")

      return Response.json(data)
    }

    // ================= STATUS =================
    if (mode === "status") {
      console.log("\n🔄 CHECK OPERATION STATUS")

      const { operationName } = body
      console.log("🆔 Operation:", operationName)

      const endpoint =
        `https://${region}-aiplatform.googleapis.com/v1/${operationName}`

      console.log("📡 Poll Endpoint:", endpoint)

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken.token}`
        }
      })

      console.log("📊 Poll Status:", res.status)

      const data = await res.json()

      console.log("📥 Poll Response:", JSON.stringify(data, null, 2))

      if (data.done) {
        console.log("✅ OPERATION COMPLETE")
      } else {
        console.log("⏳ STILL PROCESSING")
      }

      return Response.json(data)
    }

    console.error("❌ INVALID MODE")
    return Response.json({ error: "Invalid mode" }, { status: 400 })

  } catch (err) {
    console.error("🔥 BACKEND ERROR:", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
