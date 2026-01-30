import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";

// Initialize Twitter client with user context (OAuth 1.0a)
const getTwitterClient = () => {
  return new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
};

// POST - Create a new tweet
export async function POST(request) {
  try {
    const { content } = await request.json();

    if (!content || content.length === 0) {
      return NextResponse.json(
        { error: "Tweet content is required" },
        { status: 400 }
      );
    }

    if (content.length > 280) {
      return NextResponse.json(
        { error: "Tweet exceeds 280 character limit" },
        { status: 400 }
      );
    }

    const client = getTwitterClient();
    const tweet = await client.v2.tweet(content);

    return NextResponse.json({
      success: true,
      tweetId: tweet.data.id,
      text: tweet.data.text,
    });
  } catch (error) {
    console.error("Twitter API Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to post tweet",
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// GET - Get authenticated user info
export async function GET() {
  try {
    const client = getTwitterClient();
    const me = await client.v2.me({ "user.fields": ["profile_image_url", "name", "username"] });

    return NextResponse.json({
      success: true,
      user: {
        id: me.data.id,
        name: me.data.name,
        username: me.data.username,
        profileImage: me.data.profile_image_url,
      },
    });
  } catch (error) {
    console.error("Twitter API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user info" },
      { status: 500 }
    );
  }
}
