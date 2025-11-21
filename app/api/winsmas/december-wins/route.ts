import { NextResponse } from "next/server";
import { loginAndGetBrowser, extractMatchHistory } from "@/lib/duprClient.js";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convexClient = new ConvexHttpClient(CONVEX_URL);

// December 2025 date range
const DECEMBER_START = new Date("2025-12-01T00:00:00Z");
const DECEMBER_END = new Date("2026-01-01T00:00:00Z");

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const dynamic = 'force-dynamic';

/**
 * POST /api/winsmas/december-wins
 * Scrapes a player's match history and counts December 2025 wins
 *
 * Body: { duprUrl: string, playerId: string }
 */
export async function POST(req: Request) {
  let browser;

  try {
    const { duprUrl, playerId } = await req.json();

    if (!duprUrl) {
      return NextResponse.json({ error: "Missing duprUrl" }, { status: 400 });
    }

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    console.log(`[Winsmas] Counting December wins for player: ${playerId}`);

    // Get authenticated browser
    browser = await loginAndGetBrowser();
    console.log("[Winsmas] Browser authenticated");

    // Navigate to player page
    const page = await browser.newPage();
    await page.goto(duprUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000, // 60 second timeout for match history
    });
    console.log("[Winsmas] Player page loaded");

    // Extract all match history with dates
    const allMatches = await extractMatchHistory(page);
    console.log(`[Winsmas] Found ${allMatches.length} total matches`);

    // Close page
    try {
      await page.close();
    } catch (_e) {
      console.log("[Winsmas] Page already closed");
    }

    // Filter for December 2025 wins only
    const decemberWins = allMatches.filter((match) => {
      if (!match.date) return false;

      const matchDate = new Date(match.date);

      // Must be a win (we're only counting wins, not all matches)
      // The extractMatchHistory function should already filter for wins,
      // but double-check here
      const isWin = match.result === "W" || match.result === "win" || match.result === "WIN";

      // Must be in December 2025
      const isInDecember = matchDate >= DECEMBER_START && matchDate < DECEMBER_END;

      return isWin && isInDecember;
    });

    console.log(`[Winsmas] Found ${decemberWins.length} December 2025 wins`);

    // Update the contest entry with December win count
    await convexClient.mutation(api.winsmas.updateDecemberWins, {
      playerId,
      decemberWins: decemberWins.length,
    });

    return NextResponse.json({
      success: true,
      decemberWins: decemberWins.length,
      totalMatches: allMatches.length,
      wins: decemberWins.map((w) => ({
        date: w.date,
        event: w.event,
        location: w.location,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("[Winsmas] Error counting December wins:", error);
    return NextResponse.json(
      {
        error: "Failed to count December wins",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("[Winsmas] Error closing browser:", e);
      }
    }
  }
}

/**
 * GET /api/winsmas/december-wins?playerId=xxx
 * Check cached December win count without re-scraping
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    // Query the contest entry to get cached count
    const entry = await convexClient.query(api.winsmas.hasEnteredWinsmas, {
      playerId,
    });

    if (!entry.hasEntered || !entry.entry) {
      return NextResponse.json({
        error: "Player not entered in Winsmas",
      }, { status: 404 });
    }

    const cacheAge = entry.entry.lastUpdated
      ? Date.now() - entry.entry.lastUpdated
      : null;

    const cacheExpired = !cacheAge || cacheAge > 6 * 60 * 60 * 1000; // 6 hours

    return NextResponse.json({
      decemberWins: entry.entry.decemberWins || 0,
      lastUpdated: entry.entry.lastUpdated,
      cacheAge,
      cacheExpired,
    });
  } catch (error: unknown) {
    console.error("[Winsmas] Error fetching cached wins:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch December wins",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
