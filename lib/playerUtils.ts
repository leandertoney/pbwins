import type { PlayerRecord } from "../types/player";

/**
 * Gets the player's rating from available rating fields.
 * Priority: duprRating → rating → singlesRating
 * Returns null if no valid rating is found.
 */
export function getPlayerRating(player: PlayerRecord): number | null {
  if (typeof player.duprRating === "number" && player.duprRating > 0) {
    return player.duprRating;
  }
  if (typeof player.rating === "number" && player.rating > 0) {
    return player.rating;
  }
  if (typeof player.singlesRating === "number" && player.singlesRating > 0) {
    return player.singlesRating;
  }
  return null;
}

/**
 * Formats a rating for display.
 * Returns formatted rating string or a dash if rating is null/invalid.
 */
export function formatRating(rating: number | null): string {
  if (typeof rating === "number" && rating > 0) {
    return rating.toFixed(2);
  }
  return "—";
}

/**
 * Gets and formats a player's rating for display.
 */
export function getFormattedPlayerRating(player: PlayerRecord): string {
  return formatRating(getPlayerRating(player));
}
