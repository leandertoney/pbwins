import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      duprUrl,
      wins,
      rating,
      imageUrl,
      gender,
      birthYear,
      city,
      state,
      country,
      locationRaw,
      losses,
      singlesRating,
      verifiedSince,
      yearsActive
    } = body;

    if (!name || !duprUrl || wins === undefined || rating === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, duprUrl, wins, rating" },
        { status: 400 }
      );
    }

    console.log('Saving player to Convex:', { name, wins, rating, gender, birthYear, city, state, country, verifiedSince, yearsActive });

    // Generate premium bio if we have the necessary data
    let bio;
    if (verifiedSince && yearsActive !== undefined && wins !== undefined && rating !== undefined) {
      const year = verifiedSince ? new Date(verifiedSince).getFullYear() : null;
      const verifiedSinceText = year ? `since ${year}` : "recently";
      const activity = yearsActive >= 3
        ? `over ${Math.floor(yearsActive)} years`
        : yearsActive === 0
        ? "recently"
        : `${Math.floor(yearsActive)} ${Math.floor(yearsActive) === 1 ? 'year' : 'years'}`;

      const consistency = wins >= 100
        ? "a dominant force"
        : wins >= 50
        ? "a consistent finisher"
        : wins >= 20
        ? "an emerging competitor"
        : "a rising talent";

      const location = city || "their region";
      const ratingText = rating ? ` with a ${rating.toFixed(2)} rating` : "";
      const firstName = name.split(' ')[0] || name;

      bio = `${name} has been competing ${verifiedSinceText}, logging ${wins} pbWins.com Verified wins over ${activity}. Known as ${consistency}${ratingText}, ${firstName} has become one of ${location}'s most active competitors.`;
    }

    const result = await client.mutation(api.players.savePlayer, {
      name,
      duprUrl,
      wins,
      rating,
      imageUrl: imageUrl || undefined,
      gender: gender || undefined,
      birthYear: birthYear || undefined,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      locationRaw: locationRaw || undefined,
      losses: losses || undefined,
      singlesRating: singlesRating || undefined,
      verifiedSince: verifiedSince || undefined,
      yearsActive: yearsActive !== undefined ? Math.floor(yearsActive) : undefined,
      bio: bio || undefined,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Save player error:", error);
    return NextResponse.json(
      { error: "Failed to save player", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
