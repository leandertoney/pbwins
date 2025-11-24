"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import WinsmasCountdown from "@/components/WinsmasCountdown";
import WinsmasLeaderboard from "@/components/WinsmasLeaderboard";
import { Id } from "@/convex/_generated/dataModel";
import SponsorRailMobile from "@/components/SponsorRailMobile";

const CHALLENGES = [
  {
    id: "winsmas-10",
    title: "10-Win Challenge",
    target: 10,
    prize: "3-pack of premium pickleballs",
  },
  {
    id: "winsmas-15",
    title: "15-Win Challenge",
    target: 15,
    prize: "Performance tee or apparel piece",
  },
  {
    id: "winsmas-25",
    title: "25-Win Challenge",
    target: 25,
    prize: "Pro-level paddle from a leading brand",
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
  const [sponsorChallengeId, setSponsorChallengeId] = useState<string | null>(null);
  const [sponsorSubmitting, setSponsorSubmitting] = useState(false);
  const [sponsorMessage, setSponsorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sponsorForm, setSponsorForm] = useState({
    name: "",
    brand: "",
    contactEmail: "",
    website: "",
    note: "",
  });

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
  const activeChallenge = useMemo(
    () => CHALLENGES.find((c) => c.id === sponsorChallengeId) || null,
    [sponsorChallengeId]
  );

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

  const handleSponsorSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeChallenge) return;
    if (!sponsorForm.name.trim() || !sponsorForm.contactEmail.trim()) {
      setSponsorMessage({ type: "error", text: "Name and email are required." });
      return;
    }

    setSponsorSubmitting(true);
    setSponsorMessage(null);
    try {
      const resp = await fetch("/api/winsmas/sponsor-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sponsorForm,
          challengeId: activeChallenge.id,
          challengeTitle: activeChallenge.title,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.error || "Failed to send inquiry");
      }

      setSponsorMessage({
        type: "success",
        text: "Thanks! We'll be in touch shortly.",
      });
      setSponsorForm({
        name: "",
        brand: "",
        contactEmail: "",
        website: "",
        note: "",
      });
    } catch (error) {
      console.error(error);
      setSponsorMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send inquiry",
      });
    } finally {
      setSponsorSubmitting(false);
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
        <div className="flex flex-col items-end gap-1 text-right text-white/70 text-xs sm:text-sm">
          <span className="text-sm sm:text-base font-semibold text-white/80">Winsmas 2025</span>
          <span className="text-brand-light">Dec 1–31, 2025</span>
          <span className="text-white/60 text-[11px] sm:text-xs">Entry closes Nov 30, 11:59 PM PT</span>
        </div>
      </header>
      {/* Mobile sponsor strip (top) */}
      <SponsorRailMobile idPrefix="winsmas-top" className="bg-white/5 border-b border-white/10" />

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
            <p className="text-sm text-white/60">
              Entry deadline: Nov 30, 2025 at 11:59 PM PT. Eligible wins: Dec 1–31, 2025.
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
                  <button
                    type="button"
                    onClick={() => setSponsorChallengeId(challenge.id)}
                    className="text-xs text-white/50 hover:text-brand-light transition text-left"
                  >
                    Sponsor this challenge
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

        {/* Sponsor highlight */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#13161b] via-[#0f1216] to-[#0b0f12] p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-semibold">Sponsor Winsmas</h2>
            <p className="text-sm text-white/60">
              Brands can claim challenge visibility: balls, apparel, or paddles.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CHALLENGES.map((challenge) => (
              <div
                key={`sponsor-${challenge.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">{challenge.title}</p>
                <p className="text-lg font-semibold text-white">
                  {challenge.prize}
                </p>
                <p className="text-sm text-white/60">
                  Feature your brand on this challenge card and confirmation emails.
                </p>
                <button
                  type="button"
                  onClick={() => setSponsorChallengeId(challenge.id)}
                  className="text-xs text-brand-light hover:text-brand underline"
                >
                  Contact about sponsoring →
                </button>
              </div>
            ))}
          </div>
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
              <li>Entry deadline: Nov 30, 2025 at 11:59 PM PT.</li>
              <li>Eligible wins: Dec 1–31, 2025. Verified wins only.</li>
              <li>Any DUPR-verified play counts (tourneys, leagues, rec).</li>
              <li>Join multiple challenges; prizes scale with targets.</li>
              <li>Email required for confirmations and prize delivery.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Mobile sponsor strip (bottom) */}
      <div className="lg:hidden border-t border-white/10 bg-white/5">
        <SponsorRailMobile idPrefix="winsmas-bottom" />
      </div>

      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1216] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">Sponsor Inquiry</p>
                <h2 className="text-xl font-semibold text-white mt-1">
                  {activeChallenge.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSponsorChallengeId(null);
                  setSponsorMessage(null);
                }}
                className="text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Fill out the form below and our team will reach out with placement details for the{" "}
              {activeChallenge.title.toLowerCase()}.
            </p>
            <form className="space-y-3" onSubmit={handleSponsorSubmit}>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={sponsorForm.name}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">
                    Brand / Company
                  </label>
                  <input
                    type="text"
                    value={sponsorForm.brand}
                    onChange={(e) => setSponsorForm((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={sponsorForm.contactEmail}
                    onChange={(e) => setSponsorForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">
                  Website (optional)
                </label>
                <input
                  type="text"
                  value={sponsorForm.website}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, website: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-white/50 mb-1">
                  Notes
                </label>
                <textarea
                  value={sponsorForm.note}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand resize-none"
                  placeholder="Share what you’d like to feature..."
                />
              </div>
              <button
                type="submit"
                disabled={sponsorSubmitting}
                className="w-full rounded-full border border-brand/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-light transition hover:bg-brand/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sponsorSubmitting ? "Sending..." : "Send inquiry"}
              </button>
            </form>
            {sponsorMessage && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                  sponsorMessage.type === "success"
                    ? "border-green-500/40 bg-green-500/10 text-green-200"
                    : "border-red-500/40 bg-red-500/10 text-red-200"
                }`}
              >
                {sponsorMessage.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
