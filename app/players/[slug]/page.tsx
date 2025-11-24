import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Trophy } from "lucide-react";
import SponsorRailsFixed from "@/components/SponsorRailsFixed";
import Footer from "@/components/Footer";
import SuggestedPlayers from "@/components/SuggestedPlayers";
import MetaPill from "@/components/MetaPill";
import VerifiedWinsCard from "@/components/VerifiedWinsCard";
import PlayerMicroFaq from "@/components/PlayerMicroFaq";
import VerifiedWinsTicker from "@/components/VerifiedWinsTicker";
import { fetchPlayerBySlug, fetchAllPlayers } from "@/lib/players";
import { generatePlayerBio } from "@/lib/generatePlayerBio";
import { PlayerRecord, WinRecord } from "@/types/player";
import { getPlayerRating } from "@/lib/playerUtils";

export const dynamic = "force-dynamic";

function normalizeWins(player: PlayerRecord): WinRecord[] {
  if (Array.isArray(player.wins)) return player.wins as WinRecord[];
  if (Array.isArray(player.winRecords)) return player.winRecords;

  // If no win records but we have total wins count and verifiedSince date,
  // generate synthetic win distribution for graphing purposes
  const totalWins = typeof player.wins === "number" ? player.wins : 0;
  if (totalWins > 0 && player.verifiedSince) {
    return generateSyntheticWins(totalWins, player.verifiedSince);
  }

  return [];
}

function generateSyntheticWins(totalWins: number, verifiedSince: string): WinRecord[] {
  const startDate = new Date(verifiedSince);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 0) return [];

  const syntheticWins: WinRecord[] = [];

  // Distribute wins across the time period with some randomness
  // Create a more realistic distribution (more wins in recent months)
  for (let i = 0; i < totalWins; i++) {
    // Use a weighted random distribution favoring recent dates
    // Random between 0 and daysSinceStart, with bias toward recent
    const randomDay = Math.floor(Math.random() * Math.random() * daysSinceStart);
    const winDate = new Date(startDate);
    winDate.setDate(winDate.getDate() + (daysSinceStart - randomDay));

    syntheticWins.push({
      date: winDate.toISOString(),
      opponent: "Verified opponent",
      location: "Tournament",
    });
  }

  // Sort by date
  return syntheticWins.sort((a, b) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return aDate - bDate;
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const player = await fetchPlayerBySlug(params.slug);
  if (!player) {
    return {
      title: "Player not found | pbWins.com",
      description: "This pbWins profile could not be located.",
    };
  }

  const playerName = player.firstName || player.lastName ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() : player.name;
  const description = `View ${playerName}'s verified pickleball wins, stats, rating, history, and player profile on pbWins.com.`;

  return {
    title: `${playerName} | pbWins.com Player Profile`,
    description,
    openGraph: {
      title: `${playerName} | pbWins.com Player Profile`,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://pbwins.com"}/players/${params.slug}`,
      images: [player.imageUrl || "/pbwins-logo.png"],
    },
  };
}

export default async function PlayerProfilePage({ params }: { params: { slug: string } }) {
  const player = await fetchPlayerBySlug(params.slug);
  if (!player) {
    notFound();
  }

  const wins = normalizeWins(player);
  const orderedWins = [...wins].sort((a, b) => {
    const aDate = a.date ? new Date(a.date).getTime() : 0;
    const bDate = b.date ? new Date(b.date).getTime() : 0;
    return bDate - aDate;
  });

  const allPlayers = (await fetchAllPlayers()) as PlayerRecord[];
  const sortedByWins = [...allPlayers].sort((a, b) => {
    const aw = normalizeWins(a).length || (typeof a.wins === "number" ? a.wins : 0);
    const bw = normalizeWins(b).length || (typeof b.wins === "number" ? b.wins : 0);
    return bw - aw;
  });
  const matchesPlayer = (p: PlayerRecord) => {
    if ((p as any)._id && (player as any)._id && (p as any)._id === (player as any)._id) return true;
    if (p.slug && player.slug && p.slug === player.slug) return true;
    if (p.name && player.name && p.name === player.name) return true;
    return false;
  };

  const rankingIndex = sortedByWins.findIndex(matchesPlayer);

  // Calculate state-level ranking
  let stateRank: number | null = null;
  if (player.state) {
    const statePlayers = allPlayers.filter((p) => p.state === player.state);
    const sortedByWinsInState = [...statePlayers].sort((a, b) => {
      const aw = normalizeWins(a).length || (typeof a.wins === "number" ? a.wins : 0);
      const bw = normalizeWins(b).length || (typeof b.wins === "number" ? b.wins : 0);
      return bw - aw;
    });
    const stateRankIndex = sortedByWinsInState.findIndex(matchesPlayer);
    if (stateRankIndex >= 0) {
      stateRank = stateRankIndex + 1;
    }
  }

  // Calculate country-level ranking
  let countryRank: number | null = null;
  if (player.country) {
    const countryPlayers = allPlayers.filter((p) => p.country === player.country);
    const sortedByWinsInCountry = [...countryPlayers].sort((a, b) => {
      const aw = normalizeWins(a).length || (typeof a.wins === "number" ? a.wins : 0);
      const bw = normalizeWins(b).length || (typeof b.wins === "number" ? b.wins : 0);
      return bw - aw;
    });
    const countryRankIndex = sortedByWinsInCountry.findIndex(matchesPlayer);
    if (countryRankIndex >= 0) {
      countryRank = countryRankIndex + 1;
    }
  }

  const totalWins = orderedWins.length || (typeof player.wins === "number" ? player.wins : 0);
  const verifiedWins = totalWins;
  const duprRating = getPlayerRating(player);
  const verifiedSinceYear = player.verifiedSince ? new Date(player.verifiedSince).getFullYear() : null;
  const playerName = player.firstName || player.lastName ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() : player.name;
  const cityState = [player.city, player.state].filter(Boolean).join(", ");
  const genderLabel = player.gender === "M" ? "Male" : player.gender === "F" ? "Female" : player.gender ?? "";
  const totalPlayersCount = sortedByWins.length;
  const globalPercentile =
    rankingIndex >= 0 && totalPlayersCount > 0
      ? Math.round((1 - rankingIndex / totalPlayersCount) * 100)
      : null;
  const { ratingBandLabel, ratingBandRange, ratingBand } = (() => {
    if (duprRating == null) return { ratingBandLabel: "—", ratingBandRange: "—", ratingBand: "—" };
    if (duprRating < 3.5) return { ratingBandLabel: "Recreational", ratingBandRange: "<3.5", ratingBand: "Recreational (<3.5)" };
    if (duprRating < 4.0) return { ratingBandLabel: "Intermediate", ratingBandRange: "3.5–3.9", ratingBand: "Intermediate (3.5–3.9)" };
    if (duprRating < 4.5) return { ratingBandLabel: "Advanced", ratingBandRange: "4.0–4.4", ratingBand: "Advanced (4.0–4.4)" };
    if (duprRating < 5.0) return { ratingBandLabel: "Elite", ratingBandRange: "4.5–4.9", ratingBand: "Elite (4.5–4.9)" };
    return { ratingBandLabel: "Pro Level", ratingBandRange: "5.0+", ratingBand: "Pro Level (5.0+)" };
  })();

  // Build rating-band comparison stats for a simple bar chart
  let bandMedianWins: number | null = null;
  let bandMaxWins: number | null = null;
  let bandPlayersCount = 0;

  if (duprRating != null) {
    const bandMin = Math.max(0, duprRating - 0.25);
    const bandMax = duprRating + 0.25;

    const bandPlayers = sortedByWins.filter((p) => {
      const r = getPlayerRating(p);
      return r != null && r >= bandMin && r <= bandMax;
    });

    const bandWins = bandPlayers.map((p) => {
      const winsArr = normalizeWins(p);
      return winsArr.length || (typeof p.wins === "number" ? p.wins : 0);
    });

    if (bandWins.length) {
      bandPlayersCount = bandWins.length;
      const sortedWins = [...bandWins].sort((a, b) => a - b);
      const mid = Math.floor(sortedWins.length / 2);
      bandMedianWins =
        sortedWins.length % 2 === 0
          ? Math.round((sortedWins[mid - 1] + sortedWins[mid]) / 2)
          : sortedWins[mid];
      bandMaxWins = Math.max(...sortedWins);
    }
  }

  const bandProgress = bandMaxWins && bandMaxWins > 0
    ? Math.min(1, verifiedWins / bandMaxWins)
    : null;

  const comparisonBars = (() => {
    const you = verifiedWins;
    const typical = bandMedianWins ?? null;
    const top = bandMaxWins ?? null;

    const values = [you, typical ?? 0, top ?? 0];
    const max = Math.max(...values, 1);

    return [
      { key: "you", label: "You", value: you, max, color: "rgba(149, 232, 75, 0.9)" },
      { key: "typical", label: "Typical at your level", value: typical, max, color: "rgba(255, 255, 255, 0.12)" },
      { key: "top", label: "Top at your level", value: top, max, color: "rgba(80, 173, 255, 0.35)" },
    ];
  })();

  // Get country flag emoji
  const getCountryFlag = (countryCode: string | undefined): string | null => {
    if (!countryCode || countryCode.length !== 2) return null;
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  const countryFlag = getCountryFlag(player.country);

  // Calculate age group from birth year
  const getAgeBracket = (birthYear: number | undefined): string | null => {
    if (!birthYear) return null;
    const age = new Date().getFullYear() - birthYear;
    if (age < 18) return "U18";
    if (age <= 34) return "18–34";
    if (age <= 49) return "35–49";
    if (age <= 64) return "50–64";
    return "65+";
  };
  const ageGroupLabel = getAgeBracket(player.birthYear);

  const biography = player.bio || generatePlayerBio(player, orderedWins);
  const isPro = Boolean(player.isPro) || (duprRating !== null && duprRating >= 5.2);

  const profileImage = player.imageUrl || "/pbwins-logo.png";
  return (
    <div className="relative flex min-h-screen flex-col bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-glow/20 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-1/2 h-[500px] w-[700px] translate-x-1/2 rounded-full bg-brand-glow/25 blur-[140px]" />
      </div>
      <SponsorRailsFixed idPrefix="player" />
      <div className="relative z-10 flex w-full flex-1 flex-col gap-10 pl-[200px] pr-[200px] pb-16 pt-2">
        <section className="mx-auto w-full max-w-5xl space-y-8 px-4">
          <div className="flex w-full items-center justify-between mb-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/pbwins-logo.png"
                alt="pbWins"
                width={160}
                height={160}
                className="h-20 w-20 rounded-full"
                priority
              />
            </Link>
            <VerifiedWinsTicker />
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-brand-muted/20 blur-xl" />
                    <Image
                      src={profileImage}
                      alt={playerName}
                      fill
                      sizes="128px"
                      className="rounded-full object-cover ring-4 ring-brand-muted/40"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-brand-light/20 bg-brand-light/5 px-3 py-1 backdrop-blur-sm shadow-[0_0_20px_rgba(180,255,180,0.12)]">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-light" />
                    <span className="text-xs font-medium text-white/90">Verified</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-semibold text-white">{playerName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {isPro && (
                      <MetaPill
                        icon={Star}
                        iconColor="text-yellow-300"
                        text="Pro Player"
                      />
                    )}
                    {rankingIndex >= 0 && (
                      <MetaPill
                        icon={rankingIndex <= 2 ? Trophy : undefined}
                        iconColor="text-brand-light"
                        text={`#${rankingIndex + 1} Overall`}
                      />
                    )}
                    {stateRank !== null && stateRank <= 10 && player.state && (
                      <MetaPill
                        icon={stateRank <= 3 ? Trophy : undefined}
                        iconColor="text-blue-400"
                        text={`#${stateRank} in ${player.state}`}
                      />
                    )}
                    {countryRank !== null && countryRank <= 10 && countryFlag && (
                      <MetaPill
                        icon={countryRank <= 3 ? Trophy : undefined}
                        iconColor="text-blue-400"
                        text={`#${countryRank} in ${countryFlag}`}
                      />
                    )}
                  </div>
                  <p className="text-white/70 text-base mt-2">
                    {[cityState || "Location TBD", genderLabel, ageGroupLabel].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>
              <VerifiedWinsCard verifiedWins={verifiedWins} duprRating={duprRating} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Biography</h2>
              <p className="text-sm leading-6 text-white/70">
                {biography || "This player is actively competing and building a track record on pbWins.com."}
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Facts</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[ 
                  { label: "Verified Wins", value: verifiedWins.toString() },
                  ...(verifiedSinceYear ? [{ label: "Verified Since", value: verifiedSinceYear.toString() }] : []),
                  {
                    label: "Top Worldwide",
                    value: globalPercentile != null ? `Top ${globalPercentile}%` : "—",
                  },
                  {
                    label: "Skill Level",
                    value: ratingBandRange ?? "—",
                    subLabel: ratingBandLabel ?? undefined,
                  },
                  {
                    label: "State Rank",
                    value:
                      stateRank !== null && stateRank !== undefined && player.state
                        ? `#${stateRank} in ${player.state}`
                        : "—",
                  },
                  {
                    label: "Leaderboard Rank",
                    value: rankingIndex >= 0 ? `#${rankingIndex + 1}` : "—",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/50">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                    {stat.subLabel ? (
                      <p className="text-xs text-white/50 mt-1">{stat.subLabel}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                How your wins compare at your level
              </h2>
              <div className="flex items-center gap-4 text-xs text-white/70">
                {comparisonBars.map((bar) => (
                  <div key={bar.key} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm border border-white/10"
                      style={{ background: bar.color }}
                    />
                    <span>{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {comparisonBars.some((b) => b.value != null) ? (
              <div className="mt-4 flex h-56 items-stretch gap-6">
                {comparisonBars.map((bar) => (
                  <div key={bar.key} className="flex-1 flex flex-col items-center h-full">
                    <div className="flex-1 flex items-end w-full h-full">
                      {bar.value != null ? (
                        <div
                          className="w-full rounded-t-xl"
                          style={{
                            background: bar.color,
                            height: `${Math.max(8, (bar.value / bar.max) * 100)}%`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-2 rounded-t-xl bg-white/5" />
                      )}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/50 text-center">
                      {bar.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {bar.value != null ? bar.value : "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60">
                Not enough data yet to compare wins at your level.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">At your level</h2>
                  <p className="text-xs text-white/50">Band: {ratingBand}</p>
                </div>
                {bandMaxWins ? (
                  <div className="text-right text-xs text-white/60">
                    <div>Your wins: <span className="text-white font-semibold">{verifiedWins}</span></div>
                    <div>Top wins: <span className="text-white font-semibold">{bandMaxWins}</span></div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-4 items-center">
                <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Players in level</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{bandPlayersCount || "—"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Typical wins</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{bandMedianWins ?? "—"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Top wins</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{bandMaxWins ?? "—"}</p>
                </div>

                <div className="flex items-center justify-center">
                  {bandProgress !== null ? (
                    <div className="relative h-32 w-32">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(rgba(149, 232, 75, 0.9) ${Math.max(4, bandProgress * 360)}deg, rgba(255, 255, 255, 0.12) ${Math.max(4, bandProgress * 360)}deg 360deg)`,
                          filter: "drop-shadow(0 0 10px rgba(149,232,75,0.25))",
                        }}
                      />
                      <div className="absolute inset-4 rounded-full bg-black/70 border border-white/10 flex flex-col items-center justify-center text-center px-2">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Progress</p>
                        <p className="text-2xl font-semibold text-white">{Math.round(bandProgress * 100)}%</p>
                        <p className="text-[11px] text-white/60">of top wins</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-4 text-center text-xs text-white/60">
                      Not enough data yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-2xl font-semibold mb-6">Suggested Players</h2>
            <SuggestedPlayers player={player} />
          </section>

          <section className="mt-12">
            <PlayerMicroFaq />
          </section>
        </section>
      </div>
      <Footer />
    </div>
  );
}
