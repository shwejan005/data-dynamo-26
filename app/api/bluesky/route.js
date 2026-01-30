import { BskyAgent } from "@atproto/api";
import { NextResponse } from "next/server";

// Initialize Bluesky agent
const getAgent = async () => {
  const agent = new BskyAgent({ service: "https://bsky.social" });
  
  await agent.login({
    identifier: process.env.BLUESKY_HANDLE,
    password: process.env.BLUESKY_APP_PASSWORD,
  });
  
  return agent;
};

// POST - Create a new post
export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content || content.length === 0) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: "Post exceeds 300 character limit" },
        { status: 400 }
      );
    }

    const agent = await getAgent();
    
    const post = await agent.post({
      text: content,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      postUri: post.uri,
      cid: post.cid,
    });
  } catch (error) {
    console.error("Bluesky API Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to post",
        code: error.status,
      },
      { status: 500 }
    );
  }
}

// GET - Get authenticated user info
export async function GET() {
  try {
    const agent = await getAgent();
    const profile = await agent.getProfile({ actor: agent.session.did });

    return NextResponse.json({
      success: true,
      user: {
        did: profile.data.did,
        handle: profile.data.handle,
        displayName: profile.data.displayName,
        avatar: profile.data.avatar,
      },
    });
  } catch (error) {
    console.error("Bluesky API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user info" },
      { status: 500 }
    );
  }
}
