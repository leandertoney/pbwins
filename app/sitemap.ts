import { MetadataRoute } from "next";
import { fetchAllPlayers, createPlayerSlug } from "@/lib/players";
import { PlayerRecord } from "@/types/player";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Skip player fetching during build if NEXT_PUBLIC_CONVEX_URL is not set
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return [
      { url: baseUrl, lastModified: new Date() },
    ];
  }

  try {
    const players = await fetchAllPlayers();

    const playerEntries = players.map((player: PlayerRecord) => ({
      url: `${baseUrl}/players/${createPlayerSlug(player)}`,
      lastModified: new Date(player.updatedAt ?? Date.now()),
    }));

    return [
      { url: baseUrl, lastModified: new Date() },
      ...playerEntries,
    ];
  } catch (error) {
    console.error("Failed to generate sitemap with players:", error);
    return [
      { url: baseUrl, lastModified: new Date() },
    ];
  }
}
