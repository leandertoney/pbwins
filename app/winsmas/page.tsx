"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import WinsmasCountdown from "@/components/WinsmasCountdown";
import WinsmasLeaderboard from "@/components/WinsmasLeaderboard";
import PaddleCarousel from "@/components/PaddleCarousel";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface PlayerData {
  _id: Id<"players">;
  name: string;
  duprUrl: string;
  wins: number;
  rating: number;
  imageUrl?: string;
}

export default function WinsmasPage() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [duprUrl, setDuprUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);

  const joinWinsmas = useMutation(api.winsmas.joinWinsmas);

  // Check if user has localStorage duprUrl (already verified)
  useEffect(() => {
    const storedDuprUrl = localStorage.getItem("duprUrl");
    if (storedDuprUrl) {
      setDuprUrl(storedDuprUrl);
    }
  }, []);

  const handleVerify = async () => {
    if (!duprUrl.trim()) {
      setError("Please enter your DUPR profile URL");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Verify player via browserless API
      const response = await fetch("/api/dupr-browserless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: duprUrl }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const data = await response.json();

      if (!data.success || !data.player) {
        throw new Error("Could not retrieve player information");
      }

      // Save to main leaderboard
      const saveResponse = await fetch("/api/players/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.player.fullName,
          duprUrl,
          wins: data.player.totalWins,
          rating: data.player.doublesRating,
          imageUrl: data.player.imageUrl,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save player");
      }

      const saveData = await saveResponse.json();
      setPlayerData(saveData.player);
      localStorage.setItem("duprUrl", duprUrl);

      // Auto-join Winsmas
      await handleJoinWinsmas(saveData.player._id);

      setSuccessMessage("Successfully verified and joined Winsmas!");
      setShowVerifyModal(false);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err instanceof Error ? err.message : "Failed to verify player");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoinWinsmas = async (playerId?: Id<"players">) => {
    if (!playerId && !playerData) {
      setShowVerifyModal(true);
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const result = await joinWinsmas({
        playerId: playerId || playerData!._id,
      });

      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Join error:", err);
      setError(err instanceof Error ? err.message : "Failed to join Winsmas");
    } finally {
      setIsJoining(false);
    }
  };

  const shareText = encodeURIComponent("I just joined Winsmas! First to 25 wins in December wins a Gen 3 Paddle 🎄 Join me at");
  const shareUrl = encodeURIComponent("https://pbwins.com/winsmas");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white relative overflow-hidden">
      {/* Logo - Home Link */}
      <Link href="/" className="fixed top-4 left-4 z-50 group">
        <img
          src="/pbwins-logo.png"
          alt="PBWins"
          width={80}
          height={80}
          className="rounded-full bg-transparent transition-transform duration-300 group-hover:scale-110"
        />
      </Link>

      {/* Animated snowfall background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              fontSize: `${10 + Math.random() * 20}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Christmas lights decoration */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-green-600 via-yellow-500 via-blue-500 to-red-600 opacity-60 animate-pulse"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          {/* Christmas ornaments */}
          <div className="flex justify-center gap-4 mb-4">
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0s" }}>🎄</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>🎁</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.4s" }}>⭐</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.6s" }}>🔔</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>❄️</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-500 via-green-500 to-red-500 bg-clip-text text-transparent animate-pulse" style={{ fontFamily: 'Nunito, system-ui, sans-serif' }}>
            WINSMAS 2025
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
            First to <span className="text-brand-light font-bold">25 verified wins</span> in December wins a{" "}
            <span className="text-brand-light font-bold">Gen 3 Paddle</span> 🏆
          </p>

          {/* Countdown */}
          <div className="py-8">
            <h2 className="text-2xl font-semibold text-white/90 mb-6">Competition Ends In:</h2>
            <WinsmasCountdown />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => playerData ? handleJoinWinsmas() : setShowVerifyModal(true)}
              disabled={isJoining}
              className="relative group px-8 py-4 bg-gradient-to-r from-red-600 to-green-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-brand/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isJoining ? "Joining..." : "🎅 Join Winsmas Now"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <Link
              href="/#leaderboard"
              className="px-8 py-4 border-2 border-white/20 rounded-full font-semibold hover:border-brand hover:bg-brand/10 transition-all duration-300"
            >
              Already Verified? Just Join!
            </Link>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4 text-green-300">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-4 text-red-300">
              {error}
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-red-900/20 via-green-900/20 to-red-900/20 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <span>🎯</span>
            How It Works
            <span>🎯</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center space-y-3">
              <div className="text-5xl">1️⃣</div>
              <h3 className="font-semibold text-lg">Get Verified</h3>
              <p className="text-sm text-white/70">
                Link your DUPR profile to join the pbWins leaderboard
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center space-y-3">
              <div className="text-5xl">2️⃣</div>
              <h3 className="font-semibold text-lg">Join Winsmas</h3>
              <p className="text-sm text-white/70">
                Click the button to enter the December competition
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center space-y-3">
              <div className="text-5xl">3️⃣</div>
              <h3 className="font-semibold text-lg">Rack Up Wins</h3>
              <p className="text-sm text-white/70">
                Play matches and win throughout December 2025
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center space-y-3">
              <div className="text-5xl">4️⃣</div>
              <h3 className="font-semibold text-lg">Win the Prize!</h3>
              <p className="text-sm text-white/70">
                First to 25 verified wins takes home the Gen 3 Paddle
              </p>
            </div>
          </div>
        </section>

        {/* Live Leaderboard */}
        <section>
          <WinsmasLeaderboard />
        </section>

        {/* Prize Details - Paddle Carousel */}
        <section className="bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-yellow-900/20 border border-yellow-500/30 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <span>🏆</span>
            The Prize
            <span>🏆</span>
          </h2>

          <PaddleCarousel />

          <div className="max-w-2xl mx-auto text-center space-y-6 mt-12">
            <p className="text-white/70">
              Win one of these premium paddles featuring cutting-edge technology and professional-grade construction.
              The ultimate reward for the most dedicated player this December!
            </p>

            <div className="pt-6 border-t border-white/10">
              <p className="text-sm text-white/50 mb-2">Want to sponsor this challenge?</p>
              <Link
                href="/advertise"
                className="inline-block text-brand-light hover:text-brand transition underline"
              >
                Become a Sponsor →
              </Link>
            </div>
          </div>
        </section>

        {/* Share Section */}
        <section className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Spread the Holiday Spirit! 🎄</h2>
          <p className="text-white/70 mb-8">
            Challenge your friends to join Winsmas and compete for the prize
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1DA1F2] rounded-full font-semibold hover:bg-[#1a8cd8] transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
              Share on Twitter
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#4267B2] rounded-full font-semibold hover:bg-[#365899] transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText("https://pbwins.com/winsmas");
                setSuccessMessage("Link copied to clipboard!");
                setTimeout(() => setSuccessMessage(""), 3000);
              }}
              className="px-6 py-3 bg-white/10 rounded-full font-semibold hover:bg-white/20 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>
          </div>
        </section>

        {/* Rules & FAQ */}
        <section className="bg-black/40 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8">Rules & FAQ</h2>

          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-brand-light">📅 Competition Dates</h3>
              <p className="text-white/70">December 1-31, 2025 at 11:59 PM EST</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-brand-light">✅ Win Verification</h3>
              <p className="text-white/70">
                All wins must be verified on DUPR. Your win count is automatically synced from your DUPR profile.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-brand-light">⏱️ Buffer Period</h3>
              <p className="text-white/70">
                Results will be finalized on January 5, 2026 to allow for late DUPR match uploads.
                Winner announced January 6, 2026.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-brand-light">🎯 Eligibility</h3>
              <p className="text-white/70">
                Must be a verified player on pbWins with an active DUPR profile. Wins must occur between
                December 1-31, 2025.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-brand-light">📦 Prize Delivery</h3>
              <p className="text-white/70">
                Winner will be contacted via email for shipping details. Prize ships within the continental United States.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#0E1414] rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white/90">Join Winsmas</h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-white/90 mb-6">
              Enter your DUPR profile URL to get verified and automatically join the competition.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
                  DUPR Profile URL
                </label>
                <input
                  type="text"
                  placeholder="https://dashboard.dupr.com/dashboard/player/..."
                  value={duprUrl}
                  onChange={(e) => setDuprUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:border-brand focus:bg-white/10 transition"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || !duprUrl}
                className="w-full rounded-lg bg-gradient-to-r from-red-600 to-green-600 text-white px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isVerifying ? "Verifying..." : "Verify & Join Winsmas"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}
