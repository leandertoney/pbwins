import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL must be set");
}

const convexClient = new ConvexHttpClient(convexUrl);

export async function POST() {
  try {
    console.log("Starting duprRating migration...");

    const result = await convexClient.mutation(api.players.migrateDuprRatings, {});

    console.log("Migration complete:", result);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
