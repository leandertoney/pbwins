import { NextResponse } from "next/server";
import { scrapeDupPlayer } from "@/lib/dupr";

const DUPR_URL_REGEX = /player\/(\d+)/;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing player URL" }, { status: 400 });
    }

    const match = url.match(DUPR_URL_REGEX);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid DUPR URL format. Expected dashboard.dupr.com/dashboard/player/[id]" },
        { status: 400 }
      );
    }

    const playerId = match[1];
    const scrapeResult = await scrapeDupPlayer(playerId);

    if (!scrapeResult.success) {
      return NextResponse.json({ error: scrapeResult.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, player: scrapeResult.player });
  } catch (error: unknown) {
    console.error("DUPR scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape DUPR profile", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
