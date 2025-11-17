import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import SponsorRailsFixed from "@/components/SponsorRailsFixed";
import WinsOverTime from "@/components/player/WinsOverTime";
import { fetchPlayerBySlug, fetchAllPlayers, createPlayerSlug } from "@/lib/players";
import { generatePlayerBio, determineYearsActive } from "@/lib/generatePlayerBio";
import { PlayerRecord, WinRecord } from "@/types/player";

export const revalidate = 900;

function normalizeWins(player: PlayerRecord): WinRecord[] {
  if (Array.isArray(player.wins)) return player.wins as WinRecord[];
  if (Array.isArray(player.winRecords)) return player.winRecords;
  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
  const rankingIndex = sortedByWins.findIndex((p) => p._id === player._id);

  const totalWins = orderedWins.length || (typeof player.wins === "number" ? player.wins : 0);
  const verifiedWins = totalWins;
  const duprRating = typeof player.duprRating === "number" ? player.duprRating : player.rating;
  const yearsActive = determineYearsActive(orderedWins, player.createdAt);
  const winRate = player.losses ? totalWins / (totalWins + player.losses) : null;
  const playerName = player.firstName || player.lastName ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() : player.name;
  const cityState = [player.city, player.state].filter(Boolean).join(", ");
  const genderLabel = player.gender === "M" ? "Male" : player.gender === "F" ? "Female" : player.gender ?? "";
  const biography = player.bio || generatePlayerBio(player, orderedWins);
  const isPro = Boolean(player.isPro) || (typeof duprRating === "number" && duprRating >= 5.2);

  const profileImage = player.imageUrl || "/pbwins-logo.png";
  const slug = createPlayerSlug(player);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-glow/20 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-1/2 h-[500px] w-[700px] translate-x-1/2 rounded-full bg-brand-glow/25 blur-[140px]" />
      </div>
      <SponsorRailsFixed idPrefix="player" />
      <div className="relative z-10 flex w-full flex-col gap-10 pl-[200px] pr-[200px] pb-16 pt-8">
        <section className="mx-auto w-full max-w-5xl space-y-8 px-4">
          <Link href="/" className="mx-auto mb-4 flex w-full items-center justify-center lg:mx-0 lg:justify-start">
            <Image
              src="/pbwins-logo.png"
              alt="pbWins"
              width={160}
              height={160}
              className="h-20 w-20 rounded-full"
              priority
            />
          </Link>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center">
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
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.8em] text-brand-light/80">pbwins.com verified</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold text-white">{playerName}</h1>
                    {isPro && (
                      <span className="inline-flex items-center justify-center rounded-full border border-white/25 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 px-3 py-[3px] text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-white/80 shadow-[0_0_16px_rgba(0,0,0,0.65)]">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-base">
                    {[cityState || "Location TBD", genderLabel].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </div>
              <div className="w-full max-w-xs rounded-2xl border border-brand-muted/60 bg-gradient-to-br from-black/80 to-brand-glow/15 p-6 shadow-[0_10px_40px_rgba(149,232,75,0.15)]">
                <p className="text-xs uppercase tracking-[0.5em] text-brand-light/80">DUPR rating</p>
                <p className="mt-4 text-5xl font-bold text-brand-light">
                  {typeof duprRating === "number" ? duprRating.toFixed(2) : "—"}
                </p>
                <p className="mt-2 text-xs text-white/60">Verified wins: {verifiedWins}</p>
              </div>
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
                  { label: "Total wins", value: totalWins.toString() },
                  { label: "Win rate", value: winRate ? `${Math.round(winRate * 100)}%` : "—" },
                  { label: "DUPR rating", value: typeof duprRating === "number" ? duprRating.toFixed(2) : "—" },
                  { label: "Years active", value: yearsActive ? `${yearsActive}+` : "<1" },
                  { label: "Last match", value: formatDate(orderedWins[0]?.date) },
                  { label: "Leaderboard rank", value: rankingIndex >= 0 ? `#${rankingIndex + 1}` : "—" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/50">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <WinsOverTime wins={orderedWins} />

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Verified Wins</h2>
            </div>
            {verifiedWins > 0 ? (
              <div className="divide-y divide-white/5">
                {orderedWins.slice(0, 8).map((win, idx) => (
                  <div key={idx} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{win.opponent || "Verified opponent"}</p>
                      <p className="text-xs text-white/50">{win.location || "Pickleball venue"}</p>
                    </div>
                    <div className="text-sm text-white/70">{formatDate(win.date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 py-12 text-center">
                <p className="text-lg font-semibold text-white">No verified wins yet</p>
                <p className="mt-2 text-sm text-white/60">This player is just getting started on pbWins.com.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
