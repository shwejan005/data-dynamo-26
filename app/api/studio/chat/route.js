import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an AI Video Director assistant. Your role is to help users create AI-generated videos step by step.

You guide users through a structured workflow:
1. Project Overview - Understand their content, duration, and format
2. Art Style & Aesthetic - Help them choose a visual style (3D animation, 2D vector, realistic, etc.)
3. Brand Guidelines - Understand their brand colors and logo
4. Characters - Help create character references
5. Script & Scenes - Generate and refine the script
6. Preprocessing Assets - Generate locations and outfit references
7. Scene Thumbnails - Create preview frames
8. Video Generation - Generate video clips
9. Final Video - Stitch clips together

Current step: {currentStep}

Be conversational, helpful, and guide users naturally through the process. When you extract information, format it clearly. Suggest options when users are unsure.

If the user provides information about their video project, extract and return it in a structured way:
- topic: The main subject/topic of the video
- duration: How long the video should be
- format: The aspect ratio (16:9, 9:16, 1:1)
- style: The visual style preference
- concept: A brief concept description

Always be encouraging and make the video creation process feel easy and fun!`;

export async function POST(req) {
  try {
    const { message, history, projectData, campaignId, activeStep } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history
    const chatHistory = history
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Create the chat
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: SYSTEM_PROMPT.replace("{currentStep}", activeStep || "overview"),
    });

    // Send the message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Extract project data from the response if mentioned
    const extractedData = {};
    const toolCalls = [];

    // Simple extraction logic - in production you'd use structured output
    if (message.toLowerCase().includes("minute") || message.toLowerCase().includes("second")) {
      const durationMatch = message.match(/(\d+)\s*(minute|second|min|sec)/i);
      if (durationMatch) {
        extractedData.duration = `${durationMatch[1]} ${durationMatch[2]}s`;
        toolCalls.push({ action: "Saving duration preference", status: "completed" });
      }
    }

    if (message.toLowerCase().includes("landscape") || message.toLowerCase().includes("16:9")) {
      extractedData.format = "16:9 Landscape";
      toolCalls.push({ action: "Setting format to 16:9", status: "completed" });
    } else if (message.toLowerCase().includes("vertical") || message.toLowerCase().includes("9:16")) {
      extractedData.format = "9:16 Vertical";
      toolCalls.push({ action: "Setting format to 9:16", status: "completed" });
    } else if (message.toLowerCase().includes("square") || message.toLowerCase().includes("1:1")) {
      extractedData.format = "1:1 Square";
      toolCalls.push({ action: "Setting format to 1:1", status: "completed" });
    }

    // Style detection
    const styles = ["3d animation", "2d vector", "realistic", "anime", "minimalist", "corporate"];
    for (const style of styles) {
      if (message.toLowerCase().includes(style)) {
        extractedData.style = style;
        toolCalls.push({ action: `Saving art style: ${style}`, status: "completed" });
        break;
      }
    }

    // Topic extraction (simple heuristic)
    if (message.length > 20 && !message.includes("?") && activeStep === "overview") {
      if (!projectData.topic) {
        extractedData.topic = message.substring(0, 100);
        toolCalls.push({ action: "Saving project topic", status: "completed" });
      }
    }

    // Determine next step based on collected data
    let nextStep = activeStep;
    const allData = { ...projectData, ...extractedData };
    
    if (activeStep === "overview" && allData.topic && allData.duration && allData.format) {
      nextStep = "style";
      toolCalls.push({ action: "Moving to Art Style step", status: "completed" });
    } else if (activeStep === "style" && allData.style) {
      nextStep = "brand";
      toolCalls.push({ action: "Moving to Brand Guidelines step", status: "completed" });
    }

    return NextResponse.json({
      message: text,
      toolCalls,
      projectData: Object.keys(extractedData).length > 0 ? extractedData : null,
      nextStep: nextStep !== activeStep ? nextStep : null,
    });
  } catch (error) {
    console.error("Studio chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message", details: error.message },
      { status: 500 }
    );
  }
}
