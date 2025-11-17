import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { leaderboardPlayers, extractPlayerId } from "@/lib/leaderboardPlayers";
import { scrapeDupPlayer } from "@/lib/dupr";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET() {
  if (!convexUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_CONVEX_URL must be set to run the leaderboard updater." },
      { status: 500 }
    );
  }

  const convexClient = new ConvexHttpClient(convexUrl);
  const completed: Array<{ player: string; status: string; details?: string }> = [];

  for (const entry of leaderboardPlayers) {
    const playerId = extractPlayerId(entry.duprUrl);
    if (!playerId) {
      completed.push({ player: entry.name, status: "failed", details: "Cannot parse DUPR ID" });
      continue;
    }

    const scraped = await scrapeDupPlayer(playerId);
    if (!scraped.success) {
      completed.push({ player: entry.name, status: "failed", details: scraped.error });
      continue;
    }

    try {
      await convexClient.mutation(api.players.savePlayer, {
        name: scraped.player.fullName,
        duprUrl: entry.duprUrl,
        wins: scraped.player.totalWins,
        rating: scraped.player.doublesRating,
        imageUrl: scraped.player.imageUrl || undefined,
        gender: scraped.player.gender || undefined,
        birthYear: scraped.player.birthYear || undefined,
        city: scraped.player.city || undefined,
        state: scraped.player.state || undefined,
        country: scraped.player.country || undefined,
        locationRaw: scraped.player.locationRaw || undefined,
        losses: scraped.player.totalLosses ?? undefined,
        singlesRating: scraped.player.singlesRating ?? undefined,
      });
      completed.push({ player: entry.name, status: "updated" });
    } catch (error: unknown) {
      completed.push({ player: entry.name, status: "failed", details: getErrorMessage(error) });
    }
  }

  return NextResponse.json({ updatedAt: new Date().toISOString(), results: completed });
}
