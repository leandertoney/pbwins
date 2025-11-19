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
      duprRating,
      imageUrl,
      gender,
      birthYear,
      city,
      state,
      country,
      locationRaw,
      losses,
      singlesRating
    } = body;

    if (!name || !duprUrl || wins === undefined || rating === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, duprUrl, wins, rating" },
        { status: 400 }
      );
    }

    console.log('Saving player to Convex:', { name, wins, rating, duprRating, gender, birthYear, city, state, country });

    const result = await client.mutation(api.players.savePlayer, {
      name,
      duprUrl,
      wins,
      rating,
      duprRating: duprRating !== undefined ? duprRating : rating,
      imageUrl: imageUrl || undefined,
      gender: gender || undefined,
      birthYear: birthYear || undefined,
      city: city || undefined,
      state: state || undefined,
      country: country || undefined,
      locationRaw: locationRaw || undefined,
      losses: losses || undefined,
      singlesRating: singlesRating || undefined,
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
