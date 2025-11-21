import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { leaderboardPlayers, extractPlayerId } from "@/lib/leaderboardPlayers";
import { loginAndGetBrowser, extractPlayerData } from "@/lib/duprClient.js";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL must be set to run the leaderboard updater.");
}

const convexClient = new ConvexHttpClient(convexUrl);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Force dynamic rendering - never statically generate this route at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  // Skip heavy scraping during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ status: 'skipped during build' });
  }

  const completed: Array<{ player: string; status: string; details?: string }> = [];
  let browser;

  try {
    // Get authenticated browser once for all players
    browser = await loginAndGetBrowser();
    console.log("[Cron] Browser authenticated");

    for (const entry of leaderboardPlayers) {
      const playerId = extractPlayerId(entry.duprUrl);
      if (!playerId) {
        completed.push({ player: entry.name, status: "failed", details: "Cannot parse DUPR ID" });
        continue;
      }

      try {
        console.log(`[Cron] Scraping player ${entry.name} (${playerId})`);

        // Navigate to player page
        const page = await browser.newPage();
        await page.goto(`https://dashboard.dupr.com/dashboard/player/${playerId}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // Extract player data
        const playerData = await extractPlayerData(page);
        await page.close();

        // Get additional profile info from DUPR API for demographics
        let gender = null;
        let birthYear = null;
        let city = null;
        let state = null;
        let country = null;
        let locationRaw = null;
        let imageUrl = playerData.imageUrl || null;
        let totalLosses = null;
        let singlesRating = playerData.singlesRating || null;

        // Try to fetch profile data from API for additional fields
        const token = process.env.DUPR_FOUNDER_TOKEN;
        if (token) {
          try {
            const profileResponse = await fetch(`https://api.dupr.gg/player/v1.0/${playerId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();

              const genderRaw = profileData.result?.gender;
              gender = genderRaw === "MALE" ? "M" : genderRaw === "FEMALE" ? "F" : genderRaw || null;

              const age = profileData.result?.age ? parseInt(profileData.result.age, 10) : null;
              birthYear = age ? new Date().getFullYear() - age : null;

              locationRaw = profileData.result?.shortAddress || null;
              if (locationRaw) {
                const locationParts = locationRaw.split(",").map((part: string) => part.trim());
                if (locationParts.length === 3) {
                  [city, state, country] = locationParts;
                } else if (locationParts.length === 2) {
                  [city, country] = locationParts;
                }
              }

              imageUrl = profileData.result?.imageUrl || profileData.result?.image || playerData.imageUrl || null;
            }

            // Get losses from stats API
            const statsResponse = await fetch(`https://api.dupr.gg/user/calculated/v1.0/stats/${playerId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              totalLosses = statsData.result.doubles?.losses ?? null;

              // Use singles rating from API if not found in HTML
              if (!singlesRating && statsData.result.singles?.rating) {
                singlesRating = parseFloat(statsData.result.singles.rating);
              }
            }
          } catch (_apiError) {
            console.log(`[Cron] API fetch for demographics failed for ${entry.name}, continuing with scraped data`);
          }
        }

        // Save to Convex
        await convexClient.mutation(api.players.savePlayer, {
          name: playerData.fullName,
          duprUrl: entry.duprUrl,
          wins: playerData.totalWins,
          rating: playerData.doublesRating,
          duprRating: playerData.doublesRating,
          imageUrl: imageUrl || undefined,
          gender: gender || undefined,
          birthYear: birthYear || undefined,
          city: city || undefined,
          state: state || undefined,
          country: country || undefined,
          locationRaw: locationRaw || undefined,
          losses: totalLosses ?? undefined,
          singlesRating: singlesRating ?? undefined,
        });

        completed.push({ player: entry.name, status: "updated" });
      } catch (error: unknown) {
        completed.push({ player: entry.name, status: "failed", details: getErrorMessage(error) });
      }
    }
  } catch (error: unknown) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: getErrorMessage(error) },
      { status: 500 }
    );
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
        console.log("[Cron] Browser closed");
      } catch (e) {
        console.error("[Cron] Error closing browser:", e);
      }
    }
  }

  return NextResponse.json({ updatedAt: new Date().toISOString(), results: completed });
}
