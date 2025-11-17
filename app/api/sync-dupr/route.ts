import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getEarliestMatch } from "@/lib/dupr/getEarliestMatch";
import { Id } from "@/convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Generates a premium bio for the player based on verified metrics.
 * Uses verified_since, years_active, and total wins to create compelling copy.
 */
function generatePremiumBio(
  name: string,
  verifiedSince: string | null,
  yearsActive: number,
  totalWins: number,
  rating: number,
  city?: string
): string {
  const year = verifiedSince ? new Date(verifiedSince).getFullYear() : null;
  const verifiedSinceText = year ? `since ${year}` : "recently";
  const activity = yearsActive >= 3
    ? `over ${yearsActive} years`
    : yearsActive === 0
    ? "recently"
    : `${yearsActive} ${yearsActive === 1 ? 'year' : 'years'}`;

  const consistency = totalWins >= 100
    ? "a dominant force"
    : totalWins >= 50
    ? "a consistent finisher"
    : totalWins >= 20
    ? "an emerging competitor"
    : "a rising talent";

  const location = city || "their region";
  const ratingText = rating ? ` with a ${rating.toFixed(2)} rating` : "";

  return `${name} has been competing ${verifiedSinceText}, logging ${totalWins} pbWins.com Verified wins over ${activity}. Known as ${consistency}${ratingText}, ${name.split(' ')[0] || name} has become one of ${location}'s most active competitors.`;
}

/**
 * POST /api/sync-dupr
 *
 * Accepts: { slug?: string, playerId?: string }
 * Returns: Updated player object with verified_since, years_active, and premium bio
 *
 * Process:
 * 1. Load player from DB by slug or playerId
 * 2. Use Browserless Playwright to scrape earliest verified match from DUPR
 * 3. Compute years_active from earliest match or createdAt
 * 4. Generate premium bio
 * 5. Save to DB and return updated player
 */
export async function POST(req: Request) {
  try {
    if (!convexUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CONVEX_URL is not configured" },
        { status: 500 }
      );
    }

    const convex = new ConvexHttpClient(convexUrl);
    const body = await req.json();
    const { slug, playerId } = body;

    if (!slug && !playerId) {
      return NextResponse.json(
        { error: "Missing required field: slug or playerId" },
        { status: 400 }
      );
    }

    // Fetch player
    let player;
    if (slug) {
      player = await convex.query(api.players.getBySlug, { slug });
    } else {
      player = await convex.query(api.players.getBySlug, { slug: playerId });
    }

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Check if player has duprUrl
    const duprUrl = player.duprUrl;
    if (!duprUrl) {
      return NextResponse.json(
        { error: "Player does not have a DUPR URL configured" },
        { status: 400 }
      );
    }

    // If player already has verifiedSince, skip scraping
    if (player.verifiedSince) {
      console.log(`[sync-dupr] Player ${player.name} already has verifiedSince: ${player.verifiedSince}`);

      // Recalculate years_active if needed
      const verifiedDate = new Date(player.verifiedSince);
      const currentYear = new Date().getFullYear();
      const verifiedYear = verifiedDate.getFullYear();
      const yearsActive = Math.max(1, currentYear - verifiedYear);

      const totalWins = typeof player.wins === "number" ? player.wins : 0;
      const rating = player.rating || 0;

      const bio = generatePremiumBio(
        player.name,
        player.verifiedSince,
        yearsActive,
        totalWins,
        rating,
        player.city
      );

      await convex.mutation(api.players.updatePlayerMetrics, {
        playerId: player._id as Id<"players">,
        yearsActive,
        bio,
      });

      const updatedPlayer = await convex.query(api.players.getBySlug, { slug: player.slug });

      return NextResponse.json({
        success: true,
        player: updatedPlayer,
        message: "Player metrics updated (already had verifiedSince)",
      });
    }

    console.log(`[sync-dupr] Scraping earliest match for ${player.name} from ${duprUrl}`);

    // Scrape earliest match date
    const earliestDate = await getEarliestMatch(duprUrl);

    let verifiedSince: string | null = null;
    let yearsActive = 0;

    if (earliestDate) {
      verifiedSince = earliestDate;
      const verifiedYear = new Date(earliestDate).getFullYear();
      const currentYear = new Date().getFullYear();
      yearsActive = Math.max(1, currentYear - verifiedYear);

      console.log(`[sync-dupr] Found earliest match: ${earliestDate}, years active: ${yearsActive}`);
    } else {
      // Fall back to createdAt
      if (player.createdAt) {
        const createdDate = new Date(player.createdAt);
        verifiedSince = createdDate.toISOString();
        const createdYear = createdDate.getFullYear();
        const currentYear = new Date().getFullYear();
        yearsActive = Math.max(1, currentYear - createdYear);

        console.log(`[sync-dupr] No match dates found, falling back to createdAt: ${verifiedSince}`);
      } else {
        console.log(`[sync-dupr] No dates available for ${player.name}`);
        verifiedSince = null;
        yearsActive = 0;
      }
    }

    // Generate premium bio
    const totalWins = typeof player.wins === "number" ? player.wins : 0;
    const rating = player.rating || 0;

    const bio = generatePremiumBio(
      player.name,
      verifiedSince,
      yearsActive,
      totalWins,
      rating,
      player.city
    );

    // Update player in DB
    await convex.mutation(api.players.updatePlayerMetrics, {
      playerId: player._id as Id<"players">,
      verifiedSince: verifiedSince || undefined,
      yearsActive,
      bio,
    });

    // Fetch updated player
    const updatedPlayer = await convex.query(api.players.getBySlug, { slug: player.slug });

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
      message: "Player synced successfully",
    });

  } catch (error: unknown) {
    console.error("[sync-dupr] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync player data", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
