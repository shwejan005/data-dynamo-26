import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { pdfContent, pdfSummary, style } = await request.json();

    const model = genAI.models.get("gemini-2.0-flash");

    const styleDescriptions = {
      "3d": "3D animated style with modern CGI aesthetics",
      "2d": "2D animated style with clean vector graphics",
      "realistic": "photorealistic style with live-action feel",
      "anime": "anime style with expressive characters",
    };

    const prompt = `You are a professional video script writer. Create a video script based on the following document summary and content.

Document Summary:
${pdfSummary || "General educational content"}

Document Content (excerpt):
${pdfContent?.substring(0, 3000) || "N/A"}

Visual Style: ${styleDescriptions[style] || "professional animated"}

Requirements:
1. Write a compelling narrator script that explains the key concepts
2. Break it into clear scenes (Scene 1, Scene 2, etc.)
3. Each scene should have: Scene title, Visual description, Narrator dialogue
4. Keep the total length suitable for a 2-3 minute video
5. Make it engaging and educational

Format the script clearly with scene headers and dialogue.`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const script = response.text || "Script generation failed. Please try again.";

    return NextResponse.json({
      success: true,
      script,
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}
