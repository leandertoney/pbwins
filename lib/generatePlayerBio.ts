import { WinRecord, PlayerRecord } from "@/types/player";
import { differenceInYears } from "date-fns";

export function determineYearsActive(wins: WinRecord[], createdAt?: number, verifiedSince?: string | null): number {
  // Prefer verifiedSince if available
  if (verifiedSince) {
    const verifiedDate = new Date(verifiedSince);
    if (!isNaN(verifiedDate.getTime())) {
      return Math.max(0, differenceInYears(new Date(), verifiedDate));
    }
  }

  // Fall back to computing from wins or createdAt
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

export function generatePlayerBio(player: PlayerRecord, wins: WinRecord[]): string {
  // Use stored yearsActive if available, otherwise compute it
  const yearsActive = player.yearsActive ?? determineYearsActive(wins, player.createdAt, player.verifiedSince);
  const totalWins = wins.length || player.totalWins || (typeof player.wins === 'number' ? player.wins : 0);
  const duprRating = player.duprRating || player.rating || 0;
  const city = player.city || "";
  const playerName = player.name || `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim();
  const firstName = player.firstName || player.name?.split(' ')[0] || "this player";

  // Premium bio template
  const verifiedSinceYear = player.verifiedSince ? new Date(player.verifiedSince).getFullYear() : null;
  const verifiedSinceText = verifiedSinceYear ? `since ${verifiedSinceYear}` : "recently";

  const consistency = totalWins >= 100
    ? "a dominant force"
    : totalWins >= 50
    ? "a consistent finisher"
    : totalWins >= 20
    ? "an emerging competitor"
    : "a rising talent";

  const activity = yearsActive >= 3
    ? `over ${yearsActive} years`
    : yearsActive === 0
    ? "recently"
    : `${yearsActive} ${yearsActive === 1 ? 'year' : 'years'}`;

  const location = city || "their region";
  const ratingText = duprRating ? ` with a ${duprRating.toFixed(2)} rating` : "";

  return `${playerName} has been competing ${verifiedSinceText}, logging ${totalWins} pbWins.com Verified wins over ${activity}. Known as ${consistency}${ratingText}, ${firstName} has become one of ${location}'s most active competitors.`;
}
