import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { content, image, type } = await request.json();

    if (!content && !image) {
      return NextResponse.json(
        { error: "Content or Image is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt;
    let parts = [];

    if (type === "characters" && image) {
      // Character generation from image
      prompt = `Analyze this image and generate 3 distinct character profiles that would fit in a video/story about this image.
      
      For each character provide:
      1. Role (e.g. Protagonist, Villain, Sidekick)
      2. Personality (2-3 words)
      3. Appearance description based on the image style
      
      Respond in JSON format:
      {
        "characters": [
          { "role": "...", "personality": "...", "appearance": "..." }
        ]
      }`;
      
      // Remove data:image/...;base64, prefix if present
      const base64Data = image.split(",")[1] || image;
      
      parts = [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ];
    } else {
      // Standard text analysis
      prompt = `Analyze the following document content and provide:
1. A brief summary (2-3 sentences)
2. Key topics covered
3. Suggested video structure (3-5 main sections)
4. Target audience

Document content:
${content}

Respond in a structured format.`;
      
      parts = [{ text: prompt }];
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const text = result.response.text();

    if (type === "characters") {
       // Try to parse JSON for characters
       try {
         const jsonMatch = text.match(/\{[\s\S]*\}/);
         const jsonStr = jsonMatch ? jsonMatch[0] : text;
         const data = JSON.parse(jsonStr);
         return NextResponse.json({ success: true, characters: data.characters });
       } catch (e) {
         console.error("Failed to parse character JSON:", e);
         // Fallback manual parsing or return raw text if needed, 
         // but for now let's hope Gemini behaves with the JSON prompt.
         return NextResponse.json({ success: false, error: "Failed to parse generated characters" });
       }
    }

    const summary = text || "Analysis complete. Ready to proceed with video creation.";

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze document" },
      { status: 500 }
    );
  }
}
