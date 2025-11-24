"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import WinsmasCountdown from "@/components/WinsmasCountdown";
import WinsmasLeaderboard from "@/components/WinsmasLeaderboard";
import PaddleCarousel from "@/components/PaddleCarousel";
import { Id } from "@/convex/_generated/dataModel";

const CHALLENGES = [
  {
    id: "winsmas-10",
    title: "10-Win Challenge",
    target: 10,
    prize: "pbWins Performance Tee",
  },
  {
    id: "winsmas-15",
    title: "15-Win Challenge",
    target: 15,
    prize: "Premium Paddle Cover",
  },
  {
    id: "winsmas-25",
    title: "25-Win Challenge",
    target: 25,
    prize: "Gen 3 Paddle",
  },
];

type PlayerData = {
  _id: Id<"players">;
  name: string;
};

export default function WinsmasPage() {
  const [email, setEmail] = useState("");
  const [duprUrl, setDuprUrl] = useState("");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [joinLoadingId, setJoinLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const savePlayer = useMutation(api.players.savePlayer);
  const joinChallenge = useMutation(api.winsmas.joinChallenge);

  // Load any stored session
  useEffect(() => {
    const storedEmail = localStorage.getItem("winsmasEmail");
    const storedDupr = localStorage.getItem("duprUrl");
    const storedId = localStorage.getItem("winsmasPlayerId");
    const storedName = localStorage.getItem("winsmasPlayerName");

    if (storedEmail) setEmail(storedEmail);
    if (storedDupr) setDuprUrl(storedDupr);
    if (storedId && storedName) {
      setPlayer({ _id: storedId as Id<"players">, name: storedName });
    }
  }, []);

  const challengeStatus = useQuery(
    api.winsmas.getChallengeStatus,
    player?._id ? { playerId: player._id } : "skip"
  ) as string[] | undefined;

  const joinedSet = useMemo(() => new Set(challengeStatus || []), [challengeStatus]);

  const handleVerify = async () => {
    if (!email.trim() || !duprUrl.trim()) {
      setMessage({ type: "error", text: "Enter your email and DUPR profile URL" });
      return;
    }

    setIsVerifying(true);
    setMessage(null);

    try {
      const resp = await fetch("/api/dupr-browserless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: duprUrl }),
      });

      if (!resp.ok) throw new Error("Verification failed");
      const data = await resp.json();
      if (!data.success || !data.player) throw new Error("Could not retrieve player info");

      const saveResult = await savePlayer({
        name: data.player.fullName,
        duprUrl,
        wins: data.player.totalWins,
        rating: data.player.doublesRating,
        duprRating: data.player.doublesRating,
        imageUrl: data.player.imageUrl || undefined,
        gender: data.player.gender || undefined,
        birthYear: data.player.birthYear || undefined,
        city: data.player.city || undefined,
        state: data.player.state || undefined,
        country: data.player.country || undefined,
        locationRaw: data.player.locationRaw || undefined,
        losses: data.player.totalLosses || undefined,
        singlesRating: data.player.singlesRating || undefined,
        verifiedSince: data.player.verifiedSince || undefined,
        yearsActive: data.player.yearsActive !== undefined ? Math.floor(data.player.yearsActive) : undefined,
      });

      if (!saveResult.success || !saveResult.playerId) throw new Error("Failed to save player");

      // Persist session
      localStorage.setItem("winsmasEmail", email);
      localStorage.setItem("duprUrl", duprUrl);
      localStorage.setItem("winsmasPlayerId", saveResult.playerId);
      localStorage.setItem("winsmasPlayerName", data.player.fullName || "Player");

      setPlayer({ _id: saveResult.playerId as Id<"players">, name: data.player.fullName });
      setMessage({ type: "success", text: "Verified! Pick your challenges." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Verification failed" });
    } finally {
      setIsVerifying(false);
    }
  };

  const sendConfirmationEmail = async (joinedId: string, playerName: string) => {
    try {
      await fetch("/api/winsmas/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          playerName,
          challengeId: joinedId,
        }),
      });
    } catch (e) {
      console.warn("Confirmation email failed", e);
    }
  };

  const handleJoin = async (challengeId: string) => {
    if (!player || !player._id) {
      setMessage({ type: "error", text: "Verify first, then join challenges." });
      return;
    }
    if (!email.trim()) {
      setMessage({ type: "error", text: "Email is required." });
      return;
    }

    setJoinLoadingId(challengeId);
    setMessage(null);
    try {
      const result = await joinChallenge({
        playerId: player._id,
        email,
        contestId: challengeId,
      });
      setMessage({ type: "success", text: result.message || "Joined!" });
      // Optimistic: add to joined set via localStorage-driven state
      joinedSet.add(challengeId);
      sendConfirmationEmail(challengeId, player.name || "Player");
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to join" });
    } finally {
      setJoinLoadingId(null);
    }
  };

  const shareText = encodeURIComponent("I just joined Winsmas! Track your wins and unlock prizes.");
  const shareUrl = encodeURIComponent("https://pbwins.com/winsmas");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0d10] to-black text-white">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/">
          <Image src="/pbwins-logo.png" alt="pbWins" width={56} height={56} className="rounded-full" />
        </Link>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span>Winsmas 2025</span>
          <span className="text-brand-light">Dec 1 - Dec 31</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16 space-y-14">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-light/80">Holiday challenge</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Track your December wins. Unlock premium prizes.
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Any verified DUPR win counts—tournaments, leagues, or rec play. Pick your challenges and climb.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Verified wins only</span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Live leaderboard</span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">Multiple prize tiers</span>
            </div>
            <div className="max-w-lg p-4 rounded-2xl border border-white/10 bg-white/5">
              <WinsmasCountdown />
            </div>
          </div>

          {/* Verify panel */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151a1f] via-[#101417] to-[#0b0f12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] space-y-4">
            <h2 className="text-xl font-semibold">Verify & save your profile</h2>
            <p className="text-sm text-white/70">Enter once. We’ll remember your email and DUPR.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">DUPR profile URL</label>
                <input
                  type="text"
                  value={duprUrl}
                  onChange={(e) => setDuprUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="https://dashboard.dupr.com/dashboard/player/..."
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={isVerifying || !email || !duprUrl}
                className="w-full rounded-lg bg-gradient-to-r from-red-600 to-green-600 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify profile"}
              </button>
              {player && (
                <div className="text-xs text-white/60 flex items-center justify-between">
                  <span>Signed in as</span>
                  <span className="text-white font-semibold">{player.name}</span>
                </div>
              )}
            </div>
            {message && (
              <div
                className={`text-sm rounded-lg border px-3 py-2 ${
                  message.type === "success"
                    ? "border-green-500/40 bg-green-500/10 text-green-200"
                    : "border-red-500/40 bg-red-500/10 text-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </section>

        {/* Challenges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Pick your challenges</h2>
            <p className="text-sm text-white/60">Join any or all. Each has its own prize.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CHALLENGES.map((challenge) => {
              const joined = joinedSet.has(challenge.id);
              return (
                <div
                  key={challenge.id}
                  className="rounded-2xl border border-white/10 bg-[#0f1216] p-5 flex flex-col gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">{challenge.title}</p>
                    <h3 className="text-3xl font-bold mt-1">{challenge.target} wins</h3>
                    <p className="text-sm text-white/60 mt-1">Prize: {challenge.prize}</p>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleJoin(challenge.id)}
                    disabled={!player || joinLoadingId === challenge.id || joined}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                      joined
                        ? "border-green-500/50 text-green-200 bg-green-500/10"
                        : player
                        ? "border-brand text-white hover:bg-brand/10"
                        : "border-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {joined ? "Joined" : joinLoadingId === challenge.id ? "Joining..." : "Join Challenge"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Winsmas leaderboard</h2>
            <Link href="/#leaderboard" className="text-sm text-brand-light hover:text-brand">View main leaderboard →</Link>
          </div>
          <WinsmasLeaderboard />
        </section>

        {/* Prize section */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b1f24] via-[#14181d] to-[#0f1317] p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center">Prizes</h2>
          <PaddleCarousel />
          <p className="text-center text-white/60 max-w-3xl mx-auto">
            Premium gear for serious players. Unlock better rewards as you climb from 10 to 25 wins.
          </p>
        </section>

        {/* Share & rules */}
        <section className="grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl border border-white/10 bg-[#0f1216] p-6 space-y-4">
            <h3 className="text-lg font-semibold">Share Winsmas</h3>
            <p className="text-sm text-white/60">Challenge teammates and friends to join.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm"
              >
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm"
              >
                Share on Facebook
              </a>
              <button
                onClick={() => navigator.clipboard.writeText("https://pbwins.com/winsmas")}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm"
              >
                Copy link
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f1216] p-6 space-y-3 text-sm text-white/70">
            <h3 className="text-lg font-semibold text-white">Rules</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Dates: December 1–31, 2025. Verified wins only.</li>
              <li>Any DUPR-verified play counts (tourneys, leagues, rec).</li>
              <li>Join multiple challenges; prizes scale with targets.</li>
              <li>Email required for confirmations and prize delivery.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
