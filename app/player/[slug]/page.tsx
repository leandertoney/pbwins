"use client";

import Image from "next/image";
import AdRotator from "@/components/AdRotator";
import Footer from "@/components/Footer";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SponsorRailsFixed from "@/components/SponsorRailsFixed";

export default function PlayerPage() {
  const params = useParams();
  const slug = params.slug as string;

  const player = useQuery(api.players.getBySlug, { slug });
  const otherPlayers = useQuery(api.players.getOthers, { currentSlug: slug, limit: 6 });

  if (player === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-white border-r-transparent"></div>
      </div>
    );
  }

  if (player === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-4 text-center text-white">
        <p className="text-sm uppercase tracking-[0.5em] text-white/50">Player not found</p>
        <h1 className="text-3xl font-semibold">This profile hasn&apos;t been verified yet.</h1>
        <Link
          href="/"
          className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-brand hover:bg-brand/20"
        >
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  const heroImageSrc = player.imageUrl || "/ads/pickleball-central.jpg";
  const heroImageUnoptimized = !!(player.imageUrl && /^https?:\/\//.test(player.imageUrl));
  const baseRating = player.rating ?? player.duprRating ?? player.singlesRating;
  const isPro = Boolean(player.isPro) || (typeof baseRating === "number" && baseRating >= 5.2);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(0,255,176,0.25),_transparent_60%)] blur-3xl opacity-70" />
      <SponsorRailsFixed idPrefix="legacy-player" />
      <div className="relative z-0 flex-1 w-full pl-[200px] pr-[200px]">
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
          <Link
            href="/"
            className="self-start rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-brand"
          >
            ← Back to Leaderboard
          </Link>

          <Link href="/" className="flex items-center justify-center lg:justify-start">
            <Image
              src="/pbwins-logo.png"
              alt="pbWins"
              width={160}
              height={160}
              className="mb-4 h-20 w-20 rounded-full"
              priority
            />
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-white/5 bg-white/5 p-6 glow-surface shadow-black/40 transition">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="player-avatar-ani overflow-hidden rounded-3xl border border-white/10 bg-black p-[2px] transition group-hover:scale-105">
                    <Image
                      src={heroImageSrc}
                      alt={player.name}
                      width={112}
                      height={112}
                      unoptimized={heroImageUnoptimized}
                      className="h-28 w-28 rounded-[18px] object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.5em] text-white/60">Profile</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-4xl font-semibold text-white">{player.name}</h1>
                      {isPro && (
                        <span className="inline-flex items-center justify-center rounded-full border border-white/25 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 px-3 py-[3px] text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-white/80 shadow-[0_0_16px_rgba(0,0,0,0.65)]">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand">
                      DUPR {player.rating ? player.rating.toFixed(2) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Wins</p>
                <p className="text-6xl font-bold text-brand">{player.wins ?? 0}</p>
                <p className="text-sm text-white/70">
                  Verified DUPR wins tracked live through Convex and pbWins
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rating</p>
                  <p className="text-3xl font-semibold text-brand">{player.rating ? player.rating.toFixed(2) : "—"}</p>
                  <p className="text-xs text-white/60">Current verified DUPR value</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Verified Profile</p>
                  <p className="text-sm text-white/70">Fuel your rank by verifying new DUPR wins.</p>
                  <a
                    href={player.duprUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-brand transition hover:text-white"
                  >
                    View DUPR Profile →
                  </a>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-4">
              <AdRotator slots={2} />
            </div>
          </div>

          {otherPlayers && otherPlayers.length > 0 && (
          <section className="rounded-3xl border border-white/5 bg-white/5 p-6 glow-surface shadow-black/40 transition">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Discover</p>
                  <h2 className="text-2xl font-semibold text-white">Discover more players</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otherPlayers.map((p) => (
                  <Link
                    key={p._id}
                    href={`/player/${p.slug}`}
                    className="group flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/40 p-4 transition hover:-translate-y-1 hover:border-brand hover:shadow-[0_0_25px_rgba(0,255,176,0.35)]"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/50">Wins</span>
                    </div>
                    <p className="text-sm text-white/60">Rating {p.rating ? p.rating.toFixed(2) : "—"}</p>
                    <p className="text-2xl font-bold text-brand">{p.wins ?? 0} wins</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
