import { api } from "@/convex/_generated/api";
import { getConvexClient } from "./convexClient";
import slugify from "./slugify";
import { PlayerRecord } from "@/types/player";

export async function fetchAllPlayers(): Promise<PlayerRecord[]> {
  const convex = getConvexClient();
  const players = await convex.query(api.players.getAll, {});
  return players as PlayerRecord[];
}

export async function fetchPlayerBySlug(slug: string): Promise<PlayerRecord | null> {
  const convex = getConvexClient();
  const player = await convex.query(api.players.getBySlug, { slug });
  if (player) return player;
  const players = await fetchAllPlayers();
  return players.find((p) => createPlayerSlug(p) === slug) ?? null;
}

export function createPlayerSlug(player: PlayerRecord) {
  if (player.slug) return player.slug;
  const baseName = player.firstName
    ? `${player.firstName} ${player.lastName ?? ""}`
    : player.name;
  return slugify(baseName || "player");
}
