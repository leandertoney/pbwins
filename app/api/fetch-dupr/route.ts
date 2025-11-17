import { NextResponse } from "next/server";

type DuprStatsResponse = {
  status: string;
  result: {
    singles?: {
      wins: number;
      losses: number;
    };
    doubles?: {
      wins: number;
      losses: number;
    };
    resulOverview?: {
      wins: number;
      losses: number;
      pending?: number;
    };
  };
};

export async function POST(req: Request) {
  try {
    const { duprUrl } = await req.json();

    if (!duprUrl) {
      return NextResponse.json(
        { error: "Missing DUPR URL" },
        { status: 400 }
      );
    }

    // Extract player ID from URL
    const match = duprUrl.match(/player\/(\d+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid DUPR URL format" },
        { status: 400 }
      );
    }

    const playerId = match[1];
    const founderToken = process.env.DUPR_FOUNDER_TOKEN;

    if (!founderToken) {
      console.error("DUPR_FOUNDER_TOKEN not set in .env.local");
      return NextResponse.json(
        { error: "DUPR API configuration missing" },
        { status: 500 }
      );
    }

    console.log("=== DUPR API REQUEST ===");
    console.log("Player ID:", playerId);

    // Fetch stats using the API (which works with your token)
    const statsResponse = await fetch(`https://api.dupr.gg/user/calculated/v1.0/stats/${playerId}`, {
      headers: {
        Authorization: `Bearer ${founderToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!statsResponse.ok) {
      console.error("DUPR stats API error:", statsResponse.status);
      return NextResponse.json(
        { error: "Failed to fetch player stats from DUPR" },
        { status: 500 }
      );
    }

    const statsData = (await statsResponse.json()) as DuprStatsResponse;

    console.log("=== DUPR STATS RESPONSE ===");
    console.log(JSON.stringify(statsData, null, 2));

    // Scrape the dashboard HTML to get the exact wins count displayed to users
    const pageResponse = await fetch(`https://dashboard.dupr.com/dashboard/player/${playerId}`);
    const html = await pageResponse.text();

    // Extract player name from HTML (it's in the page title and meta tags)
    let playerName = "Unknown Player";
    const nameMatch = html.match(/<title>([^<]+?) - DUPR<\/title>/) ||
                     html.match(/property="og:title" content="([^"]+?)"/);
    if (nameMatch) {
      playerName = nameMatch[1].trim();
    }

    // Extract rating from HTML
    let rating = 0;
    const ratingMatch = html.match(/Doubles Rating[^0-9]*([0-9.]+)/i);
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1]);
    }

    // Use doubles wins to match DUPR dashboard's primary "Wins" display
    // The dashboard prominently shows doubles wins as the main win count
    const totalWins = statsData.result.doubles?.wins ?? 0;

    console.log("Wins calculation:");
    console.log("- Doubles wins (used):", statsData.result.doubles?.wins ?? 0);
    console.log("- Singles wins:", statsData.result.singles?.wins ?? 0);
    console.log("- Total (doubles only):", totalWins);
    console.log("- resulOverview.wins (all + pending):", statsData.result.resulOverview?.wins);
    console.log("- Pending matches:", statsData.result.resulOverview?.pending ?? 0);

    // Extract image URL
    let imageUrl: string | undefined;
    const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
    if (imageMatch) {
      imageUrl = imageMatch[1];
    }

    const playerData = {
      name: playerName,
      rating,
      wins: totalWins,
      imageUrl,
      duprUrl: duprUrl.includes("/dashboard/player/")
        ? duprUrl
        : duprUrl.replace("/player/", "/dashboard/player/"),
    };

    console.log("Extracted player data:", playerData);

    return NextResponse.json(playerData);
  } catch (error: unknown) {
    console.error("DUPR fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DUPR profile" },
      { status: 500 }
    );
  }
}
