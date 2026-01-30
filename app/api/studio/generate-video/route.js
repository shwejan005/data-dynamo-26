import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

// Generate video using FAL's video models
export async function POST(request) {
  try {
    const { prompt, imageUrl, duration = 5 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let result;

    if (imageUrl) {
      // Image-to-video using Kling
      result = await fal.subscribe("fal-ai/kling-video/v1/standard/image-to-video", {
        input: {
          prompt,
          image_url: imageUrl,
          duration: String(duration),
          aspect_ratio: "16:9",
        },
      });
    } else {
      // Text-to-video using MiniMax
      result = await fal.subscribe("fal-ai/minimax/video-01", {
        input: {
          prompt,
        },
      });
    }

    const videoUrl = result.data?.video?.url || result.data?.video_url;

    if (!videoUrl) {
      throw new Error("No video generated");
    }

    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    console.error("FAL Video generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}
