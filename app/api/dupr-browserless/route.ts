import { NextResponse } from "next/server";
import { loginAndGetBrowser, extractPlayerData, extractFirstMatchDate } from "@/lib/duprClient.js";

const DUPR_URL_REGEX = /player\/(\d+)/;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(req: Request) {
  let browser;

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
    console.log(`[Browserless] Scraping player ${playerId}`);

    // Get authenticated browser
    browser = await loginAndGetBrowser();
    console.log("[Browserless] Browser authenticated");

    // Navigate to player page
    const page = await browser.newPage();
    await page.goto(`https://dashboard.dupr.com/dashboard/player/${playerId}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    console.log("[Browserless] Page loaded");

    // Extract player data
    const playerData = await extractPlayerData(page);
    console.log("[Browserless] Extracted data:", playerData);

    // Extract first match date (for verifiedSince)
    const firstMatchDate = await extractFirstMatchDate(page);
    console.log("[Browserless] First match date:", firstMatchDate);

    // Close page - handle case where browser connection is already closed
    try {
      await page.close();
    } catch (_e) {
      console.log("[Browserless] Page already closed");
    }

    // Get additional profile info from DUPR API for demographics
    let gender = null;
    let birthYear = null;
    let ageGroup = null;
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

          // Extract age group (e.g., "19-49", "50+", etc.)
          ageGroup = profileData.result?.ageGroup || null;

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
      } catch (apiError) {
        console.log("[Browserless] API fetch for demographics failed, continuing with scraped data:", apiError);
      }
    }

    // Calculate years active if we have first match date
    // FALLBACK: If we couldn't scrape the first match date (timeout, etc.),
    // use current date as verifiedSince to ensure the field is always populated
    const verifiedSinceDate = firstMatchDate || new Date().toISOString();

    let yearsActive = null;
    if (verifiedSinceDate) {
      const firstDate = new Date(verifiedSinceDate);
      const now = new Date();
      const diffInMs = now.getTime() - firstDate.getTime();
      const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
      yearsActive = Math.max(0.1, parseFloat(diffInYears.toFixed(1))); // Minimum 0.1 years
    }

    return NextResponse.json({
      success: true,
      player: {
        fullName: playerData.fullName,
        doublesRating: playerData.doublesRating,
        singlesRating: singlesRating,
        totalWins: playerData.totalWins,
        totalLosses: totalLosses,
        imageUrl: imageUrl,
        gender: gender,
        birthYear: birthYear,
        ageGroup: ageGroup,
        city: city,
        state: state,
        country: country,
        locationRaw: locationRaw,
        verifiedSince: verifiedSinceDate,
        yearsActive: yearsActive,
      },
    });
  } catch (error: unknown) {
    console.error("[Browserless] Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape DUPR profile", details: getErrorMessage(error) },
      { status: 500 }
    );
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("[Browserless] Error closing browser:", e);
      }
    }
  }
}
