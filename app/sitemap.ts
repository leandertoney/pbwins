import { MetadataRoute } from "next";
import { fetchAllPlayers, createPlayerSlug } from "@/lib/players";
import { PlayerRecord } from "@/types/player";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const players = await fetchAllPlayers();

  const playerEntries = players.map((player: PlayerRecord) => ({
    url: `${baseUrl}/players/${createPlayerSlug(player)}`,
    lastModified: new Date(player.updatedAt ?? Date.now()),
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    ...playerEntries,
  ];
}
