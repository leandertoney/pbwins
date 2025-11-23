import { NextResponse } from "next/server";

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

const DUPR_URL_REGEX = /player\/(\d+)/;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Quick DUPR verification using only the public API
 * This is much faster (~2-3 seconds) than Browserless scraping
 */
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
    console.log(`[Quick DUPR] Fetching player ${playerId}`);

    const token = process.env.DUPR_FOUNDER_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "DUPR API token not configured" },
        { status: 500 }
      );
    }

    // Fetch profile data from API
    const profileResponse = await fetch(`https://api.dupr.gg/player/v1.0/${playerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch player from DUPR API" },
        { status: 500 }
      );
    }

    const profileData = await profileResponse.json();

    // Fetch stats (wins/losses/ratings)
    const statsResponse = await fetch(`https://api.dupr.gg/user/calculated/v1.0/stats/${playerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let doublesRating = null;
    let singlesRating = null;
    let totalWins = null;
    let totalLosses = null;

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      doublesRating = statsData.result.doubles?.rating ? parseFloat(statsData.result.doubles.rating) : null;
      singlesRating = statsData.result.singles?.rating ? parseFloat(statsData.result.singles.rating) : null;
      totalWins = statsData.result.doubles?.wins ?? null;
      totalLosses = statsData.result.doubles?.losses ?? null;
    }

    // Extract data from profile
    const fullName = profileData.result?.fullName || null;
    const genderRaw = profileData.result?.gender;
    const gender = genderRaw === "MALE" ? "M" : genderRaw === "FEMALE" ? "F" : genderRaw || null;
    const age = profileData.result?.age ? parseInt(profileData.result.age, 10) : null;
    const birthYear = age ? new Date().getFullYear() - age : null;
    const ageGroup = profileData.result?.ageGroup || null;
    const imageUrl = profileData.result?.imageUrl || profileData.result?.image || null;
    const locationRaw = profileData.result?.shortAddress || null;

    let city = null;
    let state = null;
    let country = null;

    if (locationRaw) {
      const locationParts = locationRaw.split(",").map((part: string) => part.trim());
      if (locationParts.length === 3) {
        [city, state, country] = locationParts;
      } else if (locationParts.length === 2) {
        [city, country] = locationParts;
      }
    }

    // Use current date as verifiedSince (can be backfilled later)
    const verifiedSinceDate = new Date().toISOString();
    const yearsActive = 0.1; // Default to 0.1 years (recently verified)

    return NextResponse.json({
      success: true,
      player: {
        fullName,
        doublesRating,
        singlesRating,
        totalWins,
        totalLosses,
        imageUrl,
        gender,
        birthYear,
        ageGroup,
        city,
        state,
        country,
        locationRaw,
        verifiedSince: verifiedSinceDate,
        yearsActive: yearsActive,
      },
    });
  } catch (error: unknown) {
    console.error("[Quick DUPR] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DUPR profile", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
