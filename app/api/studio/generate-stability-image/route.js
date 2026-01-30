import { NextResponse } from "next/server";

// Generate image using Stability AI as fallback
export async function POST(request) {
  try {
    const { prompt, style } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Style modifiers for Stability AI
    const stylePrompts = {
      "3d": "3D rendered, CGI animation style, Pixar-like quality, ",
      "2d": "2D vector illustration, clean lines, flat design, ",
      "realistic": "photorealistic, cinematic lighting, 8k quality, ",
      "anime": "anime style, vibrant colors, detailed character design, ",
      "minimalist": "minimalist design, clean composition, ",
      "corporate": "professional corporate style, business-like, ",
    };

    const fullPrompt = `${stylePrompts[style] || ""}${prompt}`;
    
    console.log("Stability AI - Generating image with prompt:", fullPrompt.substring(0, 100));

    // Try the Stable Image Core API first (newer API)
    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: "image/*",
        },
        body: (() => {
          const formData = new FormData();
          formData.append("prompt", fullPrompt);
          formData.append("output_format", "png");
          formData.append("aspect_ratio", "16:9");
          return formData;
        })(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stability AI API error:", response.status, errorText);
      
      // Try fallback to v1 API
      console.log("Trying fallback to v1 API...");
      const v1Response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: fullPrompt,
                weight: 1,
              },
            ],
            cfg_scale: 7,
            height: 576,
            width: 1024,
            samples: 1,
            steps: 30,
          }),
        }
      );

      if (!v1Response.ok) {
        const v1ErrorText = await v1Response.text();
        console.error("Stability AI v1 API error:", v1Response.status, v1ErrorText);
        throw new Error(`Stability AI error: ${v1Response.status} - ${v1ErrorText}`);
      }

      const v1Data = await v1Response.json();

      if (!v1Data.artifacts || !v1Data.artifacts[0]?.base64) {
        throw new Error("No image generated from v1 API");
      }

      const imageBase64 = `data:image/png;base64,${v1Data.artifacts[0].base64}`;
      return NextResponse.json({
        success: true,
        imageUrl: imageBase64,
        type: "stability-v1",
      });
    }

    // v2 API returns binary image data
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const imageBase64 = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: imageBase64,
      type: "stability",
    });
  } catch (error) {
    console.error("Stability AI Image generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image with Stability AI" },
      { status: 500 }
    );
  }
}
