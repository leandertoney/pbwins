"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function ProfileNotificationsComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recordPageView = useMutation(api.featureInterest.recordPageView);
  const recordInterest = useMutation(api.featureInterest.recordInterest);
  const analytics = useQuery(api.featureInterest.getFeatureAnalytics, {
    featureName: "profile-notifications",
  });

  // Track page view on mount
  useEffect(() => {
    recordPageView({
      featureName: "profile-notifications",
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent || undefined,
    });
  }, [recordPageView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await recordInterest({
        featureName: "profile-notifications",
        email,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        setEmail("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="text-sm text-white/60 transition hover:text-brand"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Coming Soon
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Profile Notifications
          </h1>

          {/* Subtitle */}
          <p className="mb-12 text-lg text-white/70">
            Never miss an update on your favorite pickleball players
          </p>

          {/* Feature Preview */}
          <div className="mb-16 rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
            <h2 className="mb-6 text-2xl font-semibold">What&apos;s Coming</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-light">
                  🔔
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Get Instant Updates</h3>
                  <p className="text-sm text-white/60">
                    Receive notifications when a player&apos;s win count or DUPR rating changes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-light">
                  👤
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Follow Any Player</h3>
                  <p className="text-sm text-white/60">
                    Click a button on any profile to start receiving updates about that player
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-light">
                  📧
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Email Notifications</h3>
                  <p className="text-sm text-white/60">
                    Get notified via email whenever your followed players achieve new milestones
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-light">
                  ⚙️
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Manage Subscriptions</h3>
                  <p className="text-sm text-white/60">
                    Easy one-click unsubscribe and manage all your notifications in one place
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Signup */}
          {!submitted ? (
            <div className="mx-auto max-w-md">
              <h2 className="mb-4 text-2xl font-semibold">
                Be the First to Know
              </h2>
              <p className="mb-6 text-white/60">
                Join the waitlist and we&apos;ll notify you when profile notifications launch
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand focus:outline-none"
                  disabled={loading}
                />

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full border border-brand/70 px-6 py-3 font-semibold text-brand-light transition hover:bg-brand/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Joining..." : "Join the Waitlist"}
                </button>
              </form>

              {/* Social Proof */}
              {analytics && analytics.totalSignups > 0 && (
                <p className="mt-6 text-sm text-white/50">
                  {analytics.totalSignups} {analytics.totalSignups === 1 ? "person has" : "people have"} joined the waitlist
                </p>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-xl border border-green-500/30 bg-green-500/10 p-6">
              <div className="mb-2 text-4xl">✓</div>
              <h2 className="mb-2 text-2xl font-semibold">You&apos;re on the list!</h2>
              <p className="text-white/70">
                We&apos;ll send you an email as soon as profile notifications are ready.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-brand-light transition hover:text-brand"
              >
                Return to Leaderboard →
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Stats Footer (for admin/internal tracking) */}
      {analytics && (
        <div className="border-t border-white/10 px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold text-brand-light">
                  {analytics.totalPageViews}
                </div>
                <div className="mt-1 text-sm text-white/60">Page Views</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold text-brand-light">
                  {analytics.totalSignups}
                </div>
                <div className="mt-1 text-sm text-white/60">Waitlist Signups</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                <div className="text-3xl font-bold text-brand-light">
                  {analytics.conversionRate}%
                </div>
                <div className="mt-1 text-sm text-white/60">Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
