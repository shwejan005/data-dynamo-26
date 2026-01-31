import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    console.log("🚀 Script generation started");
    
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: API key missing" },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log("📦 Request body received:", { 
      contentLength: body.content?.length, 
      style: body.style,
      charactersCount: body.characters?.length 
    });

    const { content, style, characters, brandName } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required to generate a script" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const styleDescriptions = {
      "3d": "3D animated style like Pixar with modern CGI aesthetics",
      "2d": "2D animated style with clean vector graphics and flat design",
      "realistic": "photorealistic style with cinematic live-action feel",
      "anime": "anime style with expressive characters and vibrant colors",
      "minimalist": "minimalist style with clean shapes and simple visuals",
      "corporate": "professional corporate style suitable for business",
    };

    const characterInfo = characters?.length > 0 
      ? `\n\nCharacters to include:\n${characters.map(c => `- ${c.name}: ${c.description || c.role}`).join('\n')}`
      : '';

    const prompt = `You are a professional video script writer for ${brandName || 'a brand'}. Create a video script based on the following content.

Content to adapt:
${content.substring(0, 4000)}
${characterInfo}

Visual Style: ${styleDescriptions[style] || styleDescriptions["3d"]}

Requirements:
1. Create exactly 5 scenes for a 60-90 second video
2. Each scene must have:
   - Scene number and title
   - Duration (in seconds)
   - Visual description (what we see on screen)
   - Narration/dialogue (what is spoken)
   - Which characters appear (if any)
3. Make it engaging, clear, and professional
4. Ensure good pacing and flow between scenes

Respond ONLY with valid JSON in this format:
{
  "title": "Video Title",
  "totalDuration": 75,
  "scenes": [
    {
      "id": "scene-1",
      "number": 1,
      "title": "Scene Title",
      "duration": 15,
      "visual": "Visual description...",
      "narration": "What the narrator says...",
      "characters": ["Character Name"]
    }
  ]
}`;

    console.log("🤖 Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("✅ Gemini response received. Length:", text.length);
    console.log("📝 Raw response start:", text.substring(0, 100));

    // Parse JSON from response
    let scriptData;
    try {
      scriptData = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[1]);
      } else {
        const objectMatch = text.match(/\{[\s\S]*"scenes"[\s\S]*\}/);
        if (objectMatch) {
          scriptData = JSON.parse(objectMatch[0]);
        } else {
          console.error("❌ JSON parse failed. Raw text:", text);
          throw new Error("Could not parse script data from response");
        }
      }
    }

    return NextResponse.json({
      success: true,
      script: scriptData,
    });
  } catch (error) {
    console.error("❌ Script generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate script" },
      { status: 500 }
    );
  }
}
