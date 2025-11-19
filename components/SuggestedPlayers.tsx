import Image from "next/image";
import Link from "next/link";
import { PlayerRecord, WinRecord } from "@/types/player";
import { fetchAllPlayers, createPlayerSlug } from "@/lib/players";
import { getPlayerRating, formatRating } from "@/lib/playerUtils";

interface SuggestedPlayersProps {
  player: PlayerRecord;
}

function normalizeWins(player: PlayerRecord): WinRecord[] {
  if (Array.isArray(player.wins)) return player.wins as WinRecord[];
  if (Array.isArray(player.winRecords)) return player.winRecords;
  return [];
}

function getWinCount(player: PlayerRecord): number {
  const wins = normalizeWins(player);
  return wins.length || (typeof player.wins === "number" ? player.wins : 0);
}

function getSuggestedPlayers(currentPlayer: PlayerRecord, allPlayers: PlayerRecord[]): PlayerRecord[] {
  // Exclude the current player
  const otherPlayers = allPlayers.filter((p) => p._id !== currentPlayer._id);

  if (otherPlayers.length === 0) return [];

  const currentCity = currentPlayer.city?.toLowerCase().trim();
  const currentState = currentPlayer.state?.toLowerCase().trim();
  const currentRating = getPlayerRating(currentPlayer);

  // Primary filter: same city OR state
  const sameLocation = otherPlayers.filter((p) => {
    const pCity = p.city?.toLowerCase().trim();
    const pState = p.state?.toLowerCase().trim();
    return (currentCity && pCity === currentCity) || (currentState && pState === currentState);
  });

  // Secondary filter: similar DUPR rating (±0.25)
  const similarRating = otherPlayers.filter((p) => {
    if (currentRating === null) return false;
    const pRating = getPlayerRating(p);
    if (pRating === null) return false;
    return Math.abs(pRating - currentRating) <= 0.25;
  });

  // Tertiary: players with most verified wins
  const sortedByWins = [...otherPlayers].sort((a, b) => getWinCount(b) - getWinCount(a));

  // Build suggestion list with priority
  const suggestions: PlayerRecord[] = [];
  const seenIds = new Set<string>();

  // Helper to add unique players
  const addUnique = (players: PlayerRecord[], limit?: number) => {
    let added = 0;
    for (const p of players) {
      if (limit && added >= limit) break;
      if (!seenIds.has(p._id)) {
        suggestions.push(p);
        seenIds.add(p._id);
        added++;
      }
    }
  };

  // Add players with priority: location + rating > location > rating > top players
  const locationAndRating = sameLocation.filter((p) => similarRating.includes(p));
  addUnique(locationAndRating);

  if (suggestions.length < 6) {
    addUnique(sameLocation.filter((p) => !locationAndRating.includes(p)));
  }

  if (suggestions.length < 6) {
    addUnique(similarRating.filter((p) => !locationAndRating.includes(p)));
  }

  if (suggestions.length < 6) {
    addUnique(sortedByWins);
  }

  // Absolute fallback: random players if we still don't have at least 4
  if (suggestions.length < 4) {
    const remaining = otherPlayers.filter((p) => !seenIds.has(p._id));
    const shuffled = remaining.sort(() => Math.random() - 0.5);
    addUnique(shuffled, 6 - suggestions.length);
  }

  // Return 4-6 players
  return suggestions.slice(0, 6);
}

function truncateName(name: string, maxLength = 20): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
}

export default async function SuggestedPlayers({ player }: SuggestedPlayersProps) {
  const allPlayers = await fetchAllPlayers();
  const suggestions = getSuggestedPlayers(player, allPlayers);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-6 pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {suggestions.map((suggestedPlayer) => {
          const slug = createPlayerSlug(suggestedPlayer);
          const playerName =
            suggestedPlayer.firstName || suggestedPlayer.lastName
              ? `${suggestedPlayer.firstName ?? ""} ${suggestedPlayer.lastName ?? ""}`.trim()
              : suggestedPlayer.name;
          const cityState = [suggestedPlayer.city, suggestedPlayer.state].filter(Boolean).join(", ");
          const duprRating = getPlayerRating(suggestedPlayer);
          const profileImage = suggestedPlayer.imageUrl || "/pbwins-logo.png";

          return (
            <Link
              key={suggestedPlayer._id}
              href={`/players/${slug}`}
              className="group relative flex min-w-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/10 lg:aspect-[3/2] lg:min-w-0"
            >
              {/* Profile Image */}
              <div className="relative h-20 w-20 flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-brand-muted/20 blur-lg transition-all duration-300 group-hover:bg-brand-muted/30" />
                <Image
                  src={profileImage}
                  alt={playerName}
                  fill
                  sizes="80px"
                  className="rounded-full object-cover ring-2 ring-white/10 transition-all duration-300 group-hover:ring-white/20"
                />
              </div>

              {/* Player Info */}
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-base font-semibold text-white transition-colors duration-300 group-hover:text-brand-light">
                  {truncateName(playerName)}
                </h3>
                {cityState && (
                  <p className="text-xs text-white/60">{truncateName(cityState, 25)}</p>
                )}
                {duprRating !== null && (
                  <div className="mt-2 rounded-lg border border-brand-muted/40 bg-gradient-to-br from-black/60 to-brand-glow/10 px-3 py-1">
                    <p className="text-[0.65rem] font-semibold text-brand-light">
                      {formatRating(duprRating)} DUPR
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
