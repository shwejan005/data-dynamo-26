import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

// Generate image using FLUX
export async function POST(request) {
  try {
    const { prompt, style, aspectRatio = "16:9" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Style modifiers
    const stylePrompts = {
      "3d": "3D rendered, CGI animation style, Pixar-like quality, ",
      "2d": "2D vector illustration, clean lines, flat design, ",
      "realistic": "photorealistic, cinematic lighting, 8k quality, ",
      "anime": "anime style, vibrant colors, detailed character design, ",
    };

    const fullPrompt = `${stylePrompts[style] || ""}${prompt}`;

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: fullPrompt,
        image_size: aspectRatio === "16:9" ? "landscape_16_9" : "square",
        num_images: 1,
      },
    });

    const imageUrl = result.data?.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error("FAL Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
