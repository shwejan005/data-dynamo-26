import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { content, style, brandName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required to generate characters" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on the following content, generate exactly 3 unique character profiles for an AI-generated video.

Brand/Context: ${brandName || "General"}
Visual Style: ${style || "3D Animation"}

Content to analyze:
${content}

For each character, provide:
1. name - A fitting name for the character
2. role - Their role in the video (e.g., "Narrator", "Expert", "Customer")
3. personality - 2-3 key personality traits
4. appearance - Physical appearance description suitable for ${style || "3D Animation"} style
5. outfit - What they're wearing, considering the brand context

Respond ONLY with valid JSON in this exact format:
{
  "characters": [
    {
      "name": "Character Name",
      "role": "Their Role",
      "personality": "Trait 1, Trait 2",
      "appearance": "Detailed appearance description",
      "outfit": "Clothing description"
    }
  ]
}

Generate exactly 3 characters that would work well for this video content.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    let characters = [];
    try {
      // Try to parse the entire response as JSON first
      const parsed = JSON.parse(text);
      characters = parsed.characters || [];
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        characters = parsed.characters || [];
      } else {
        // Last resort: try to find JSON object in the text
        const objectMatch = text.match(/\{[\s\S]*"characters"[\s\S]*\}/);
        if (objectMatch) {
          const parsed = JSON.parse(objectMatch[0]);
          characters = parsed.characters || [];
        }
      }
    }

    if (!characters || characters.length === 0) {
      throw new Error("Failed to parse character data from AI response");
    }

    // Ensure we have exactly 3 characters
    characters = characters.slice(0, 3);

    return NextResponse.json({
      success: true,
      characters,
    });
  } catch (error) {
    console.error("Character generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate characters",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
