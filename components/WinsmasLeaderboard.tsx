"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function WinsmasLeaderboard() {
  const leaderboard = useQuery(api.winsmas.getWinsmasLeaderboard);
  const stats = useQuery(api.winsmas.getWinsmasStats);
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Get user email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  // Check if user is paid
  const subscription = useQuery(
    api.subscriptions.getByEmail,
    userEmail ? { email: userEmail } : "skip"
  );
  const isPaid = subscription?.isPaid || false;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger a refresh by invalidating the query
    window.location.reload();
  };

  if (!leaderboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const getRowClassName = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-600/20 via-yellow-500/10 to-yellow-600/20 border-yellow-500/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-gray-400/20 border-gray-400/30";
    if (rank === 3) return "bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-orange-600/20 border-orange-500/30";
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-600/20 to-green-600/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.totalParticipants}</div>
            <div className="text-sm text-white/70 mt-1">Total Players</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-red-600/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.playersWithWins}</div>
            <div className="text-sm text-white/70 mt-1">With Wins</div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-green-600/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.totalDecemberWins}</div>
            <div className="text-sm text-white/70 mt-1">Total Wins</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-red-600/20 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{stats.topWins}</div>
            <div className="text-sm text-white/70 mt-1">Top Score</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🎄 Live Leaderboard
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-white/70 hover:text-white transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎅</div>
            <p className="text-white/70">No participants yet. Be the first to join!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Player</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">December Wins</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-white/70 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const medal = getMedalEmoji(rank);
                  const displayName = isPaid ? entry.name : `Number ${rank}`;

                  return (
                    <>
                      <tr
                        key={entry.playerId}
                        className={`border-b border-white/5 hover:bg-white/5 transition ${getRowClassName(rank)}`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {medal ? (
                              <span className="text-2xl">{medal}</span>
                            ) : (
                              <span className="text-white/50 font-semibold text-sm w-8 text-center">{rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {isPaid ? (
                            <Link
                              href={`/players/${entry.slug}`}
                              className="flex items-center gap-3 hover:text-brand-light transition group"
                            >
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 ring-2 ring-white/20 group-hover:ring-brand/50 transition">
                                {entry.imageUrl ? (
                                  <Image
                                    src={entry.imageUrl}
                                    alt={entry.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/50 text-xl">
                                    {entry.name[0]}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-white">{entry.name}</span>
                                {(entry.city || entry.state) && (
                                  <span className="text-xs text-white/50">
                                    {[entry.city, entry.state].filter(Boolean).join(", ")}
                                  </span>
                                )}
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 ring-2 ring-white/20">
                                <div className="w-full h-full flex items-center justify-center text-white/30 text-xl">
                                  ?
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-white/50">{displayName}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-2xl font-bold text-brand-light">
                            {entry.decemberWins}
                            {rank === 1 && entry.decemberWins >= 25 && <span className="text-xl">🏆</span>}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-white/70">{isPaid ? (entry.rating?.toFixed(2) || "—") : "—"}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {entry.lastUpdated ? (
                            <span className="text-xs text-white/50">
                              {new Date(entry.lastUpdated).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-white/30">Never</span>
                          )}
                        </td>
                      </tr>
                      {/* Upgrade banner after row 5 for free users */}
                      {!isPaid && rank === 5 && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="bg-gradient-to-r from-brand/20 via-brand/30 to-brand/20 border-y border-brand/40 p-4">
                              <div className="max-w-2xl mx-auto text-center">
                                <p className="text-white font-medium mb-2">
                                  Unlock real player names, exact ranks, and more
                                </p>
                                <button
                                  onClick={() => setShowUpgradeModal(true)}
                                  className="px-6 py-2 bg-brand hover:bg-brand-light text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
                                >
                                  Upgrade to Premium
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-white/5 text-center">
          <p className="text-xs text-white/50">
            Leaderboard updates every 6 hours • Buffer period until Jan 5, 2026 for final results
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} userEmail={userEmail} />}
    </div>
  );
}

// Upgrade Modal Component
function UpgradeModal({ onClose, userEmail }: { onClose: () => void; userEmail: string | null }) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(userEmail || "");
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save email to localStorage for future use
      localStorage.setItem("userEmail", email);

      // Create checkout session
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planType: selectedPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white/70 mb-4">Unlock full leaderboard access:</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>See real player names</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>View exact rank positions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>Weekly email alerts when you move up</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>Full player profiles and stats</span>
            </li>
          </ul>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Plan Selection */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`w-full p-4 rounded-lg border-2 transition ${
              selectedPlan === "yearly"
                ? "border-brand bg-brand/20"
                : "border-white/20 bg-white/5 hover:border-white/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-semibold text-white">Yearly - $30</div>
                <div className="text-sm text-brand font-medium">Save 50%</div>
              </div>
              <div className="text-sm text-white/50 line-through">$60</div>
            </div>
          </button>
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`w-full p-4 rounded-lg border-2 transition ${
              selectedPlan === "monthly"
                ? "border-brand bg-brand/20"
                : "border-white/20 bg-white/5 hover:border-white/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-semibold text-white">Monthly - $5</div>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 bg-brand hover:bg-brand-light disabled:bg-brand/50 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Continue to Checkout"}
        </button>

        <p className="text-xs text-white/50 text-center mt-4">
          Secure payment powered by Stripe • No refunds
        </p>
      </div>
    </div>
  );
}
