import { BskyAgent, RichText } from "@atproto/api";
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

// Helper to poll for video upload completion
const waitForVideoProcessing = async (agent, jobId, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await agent.app.bsky.video.getJobStatus({ jobId });
    
    if (status.data.jobStatus.state === 'JOB_STATE_COMPLETED') {
      return status.data.jobStatus.blob;
    }
    
    if (status.data.jobStatus.state === 'JOB_STATE_FAILED') {
      throw new Error(status.data.jobStatus.error || 'Video processing failed');
    }
    
    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Video processing timeout');
};

// POST - Create a new post with optional media
export async function POST(request) {
  try {
    const formData = await request.formData();
    const content = formData.get("content");
    const mediaFile = formData.get("media");
    const mediaType = formData.get("mediaType"); // 'image' or 'video'
    const altText = formData.get("altText") || "";

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
    
    // Process rich text (links, mentions, tags)
    const rt = new RichText({ text: content });
    await rt.detectFacets(agent);

    // Build post record
    const postRecord = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };

    // Handle media upload if provided
    if (mediaFile && mediaFile.size > 0) {
      const arrayBuffer = await mediaFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const mimeType = mediaFile.type;

      if (mediaType === "video" || mimeType.startsWith("video/")) {
        // Video upload requires Bluesky's video service (video.bsky.app)
        // which isn't available through the standard SDK yet
        return NextResponse.json(
          { error: "Video upload is not yet supported. Bluesky's video API requires special access. Please upload images only for now." },
          { status: 400 }
        );
      } else {
        // Image upload
        // Check file size (max 1MB for images on Bluesky)
        if (mediaFile.size > 1000000) {
          return NextResponse.json(
            { error: "Image must be under 1MB" },
            { status: 400 }
          );
        }

        // Upload the blob
        const uploadResponse = await agent.uploadBlob(uint8Array, {
          encoding: mimeType,
        });

        // Add image embed to post
        postRecord.embed = {
          $type: "app.bsky.embed.images",
          images: [
            {
              alt: altText || "Image attachment",
              image: uploadResponse.data.blob,
              aspectRatio: { width: 1200, height: 675 }, // 16:9 default
            },
          ],
        };
      }
    }

    // Create the post
    const post = await agent.post(postRecord);

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
