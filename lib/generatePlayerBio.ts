import { WinRecord, PlayerRecord } from "@/types/player";
import differenceInYears from "date-fns/differenceInYears";

export function determineYearsActive(wins: WinRecord[], createdAt?: number) {
  if (wins.length === 0 && !createdAt) return 0;
  const dates = wins
    .map((win) => (win.date ? new Date(win.date).getTime() : undefined))
    .filter(Boolean) as number[];
  if (createdAt) {
    dates.push(createdAt);
  }
  if (dates.length === 0) return 0;
  const oldest = Math.min(...dates);
  return Math.max(0, differenceInYears(new Date(), new Date(oldest)));
}

export function generatePlayerBio(player: PlayerRecord, wins: WinRecord[]) {
  const yearsActive = determineYearsActive(wins, player.createdAt);
  const totalWins = wins.length || player.totalWins || 0;
  const duprRating = player.duprRating || player.rating || "";
  const city = player.city || "";
  const consistency = totalWins >= 100 ? "a dominant force" : totalWins >= 50 ? "a consistent finisher" : "an emerging competitor";
  const activity = yearsActive >= 3 ? `for over ${yearsActive} years` : yearsActive === 0 ? "recently" : `for ${yearsActive} years`;
  const winLine = totalWins > 0 ? `${totalWins} verified wins` : "a growing stack of wins";
  return `${player.name || `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim()} has been competing ${activity}, logging ${winLine} and carving out a strong ${duprRating} DUPR rating. Known for ${consistency} and relentless play, ${player.firstName || player.name || "this player"} has become one of ${city || "their region"}'s most active competitors.`;
}
