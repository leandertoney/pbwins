import { NextResponse } from "next/server";
import { loginAndGetBrowser, extractFirstMatchDate } from "@/lib/duprClient.js";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

const DUPR_URL_REGEX = /player\/(\d+)/;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Background endpoint to backfill first match date for a player
 * This runs separately from the main verification to avoid timeout issues
 *
 * Expected timing: ~12 seconds
 * - Navigate to player page: ~2s
 * - Scroll and extract first match date: ~8-10s
 * - Update Convex record: ~1s
 */
export async function POST(req: Request) {
  let browser;

  try {
    const { duprUrl, playerId: convexPlayerId } = await req.json();

    if (!duprUrl && !convexPlayerId) {
      return NextResponse.json({
        error: "Missing duprUrl or playerId"
      }, { status: 400 });
    }

    // Extract DUPR player ID from URL if provided
    let duprPlayerId: string | null = null;
    if (duprUrl) {
      const match = duprUrl.match(DUPR_URL_REGEX);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid DUPR URL format. Expected dashboard.dupr.com/dashboard/player/[id]" },
          { status: 400 }
        );
      }
      duprPlayerId = match[1];
    }

    console.log(`[Backfill] Starting first match date extraction for player ${duprPlayerId || convexPlayerId}`);

    // Get authenticated browser (reuses existing session if available)
    browser = await loginAndGetBrowser();
    console.log("[Backfill] Browser authenticated");

    // Navigate to player page
    const page = await browser.newPage();
    await page.goto(`https://dashboard.dupr.com/dashboard/player/${duprPlayerId}`, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });
    console.log("[Backfill] Page loaded");

    // Extract first match date (this is the expensive operation)
    const firstMatchDate = await extractFirstMatchDate(page);
    console.log("[Backfill] First match date:", firstMatchDate || 'not found');

    // Close page
    try {
      await page.close();
    } catch (_e) {
      console.log("[Backfill] Page already closed");
    }

    // If we found a first match date, update the player in Convex
    if (firstMatchDate && convexPlayerId) {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        console.error("[Backfill] Missing NEXT_PUBLIC_CONVEX_URL");
        return NextResponse.json({
          error: "Missing Convex configuration"
        }, { status: 500 });
      }

      const client = new ConvexHttpClient(convexUrl);

      // Calculate years active based on first match date
      const firstMatchYear = new Date(firstMatchDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsActive = Math.max(0, currentYear - firstMatchYear);

      console.log(`[Backfill] Updating player: verifiedSince=${firstMatchDate}, yearsActive=${yearsActive}`);

      // Update the player with accurate first match date
      await client.mutation(api.players.updatePlayerMetrics, {
        playerId: convexPlayerId as any,
        verifiedSince: firstMatchDate,
        yearsActive: yearsActive,
      });

      console.log("[Backfill] Player updated successfully");

      return NextResponse.json({
        success: true,
        firstMatchDate,
        yearsActive,
        message: "First match date backfilled successfully"
      });
    }

    // No first match date found, but that's okay
    return NextResponse.json({
      success: true,
      firstMatchDate: null,
      message: "No match history found - using current date"
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error("[Backfill] Error:", message);

    return NextResponse.json(
      {
        error: "Failed to backfill first match date",
        details: message,
      },
      { status: 500 }
    );
  } finally {
    // Clean up browser connection
    if (browser) {
      try {
        await browser.disconnect();
      } catch (_e) {
        // Browser already disconnected
      }
    }
  }
}
