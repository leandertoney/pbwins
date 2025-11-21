"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function UpgradePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sponsor pbWins</h1>
          <p className="mt-2 text-sm text-white/70">
            Get your brand featured on the fastest-growing pickleball leaderboard
          </p>
        </div>

        <div className="mb-8 space-y-4 text-left">
          <div className="rounded-lg border border-white/5 bg-white/5 p-4">
            <h2 className="mb-2 text-sm font-semibold text-brand-light">What You Get</h2>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="flex items-start">
                <span className="mr-2 text-brand-light">✓</span>
                <span>Premium sponsor placement on pbWins leaderboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-brand-light">✓</span>
                <span>Rotating visibility across desktop and mobile views</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-brand-light">✓</span>
                <span>Reach thousands of engaged pickleball players monthly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-brand-light">✓</span>
                <span>Early access pricing locked in for lifetime</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-brand-light/20 bg-brand-light/5 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white">Monthly Subscription</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-brand-light">$499</span>
                <span className="text-xs text-white/60">/month</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/60">
              Limited to 20 sponsors per month • Cancel anytime
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-light focus:bg-white/10"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-light px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-[#0f1114] transition hover:bg-brand-light/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Lock Your Spot — $499"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-white/50">
            Secure payment powered by Stripe • Subscription-based • Cancel anytime
          </p>
          <Link
            href="/"
            className="inline-block text-xs text-white/60 hover:text-white/80 transition"
          >
            ← Back to leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
