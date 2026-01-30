import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const model = genAI.models.get("gemini-2.0-flash");

    const prompt = `Analyze the following document content and provide:
1. A brief summary (2-3 sentences)
2. Key topics covered
3. Suggested video structure (3-5 main sections)
4. Target audience

Document content:
${content}

Respond in a structured format.`;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summary = response.text || "Analysis complete. Ready to proceed with video creation.";

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
