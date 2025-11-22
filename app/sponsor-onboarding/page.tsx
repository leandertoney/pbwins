"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function SponsorOnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateSponsorInfo = useMutation(api.sponsorSlots.updateSponsorInfo);
  const sponsor = useQuery(
    api.sponsorSlots.getSponsorByCheckout,
    sessionId ? { checkoutSessionId: sessionId } : "skip"
  );

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session. Please contact support.");
      return;
    }

    // If sponsor already completed onboarding, redirect to success
    if (sponsor?.isActive) {
      router.push(`/success?session_id=${sessionId}`);
    }
  }, [sessionId, sponsor, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionId) {
      setError("Invalid session");
      return;
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      setError("Please enter a valid website URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);

    try {
      await updateSponsorInfo({
        checkoutSessionId: sessionId,
        businessName,
        tagline,
        websiteUrl,
      });

      // Redirect to final success page
      router.push(`/success?session_id=${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400">Invalid Session</h1>
          <p className="mt-3 text-sm text-white/70">
            This onboarding link is invalid. Please contact support@pbwins.com
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/60"
          >
            Back to leaderboard
          </Link>
        </div>
      </main>
    );
  }

  if (sponsor === undefined) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
        <div className="text-white/50">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#080909] px-4 text-center text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0f1114] p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome, Sponsor!</h1>
          <p className="mt-2 text-sm text-white/70">
            Complete your profile to activate your sponsor placement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label htmlFor="businessName" className="mb-1.5 block text-xs font-semibold text-white/80">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="e.g., Court Crowd"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              maxLength={50}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-light focus:bg-white/10"
            />
            <p className="mt-1 text-xs text-white/50">Max 50 characters</p>
          </div>

          <div className="text-left">
            <label htmlFor="tagline" className="mb-1.5 block text-xs font-semibold text-white/80">
              Tagline
            </label>
            <input
              id="tagline"
              type="text"
              placeholder="e.g., Know who's on the court"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              maxLength={60}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-light focus:bg-white/10"
            />
            <p className="mt-1 text-xs text-white/50">Max 60 characters - short & punchy</p>
          </div>

          <div className="text-left">
            <label htmlFor="websiteUrl" className="mb-1.5 block text-xs font-semibold text-white/80">
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-brand-light focus:bg-white/10"
            />
            <p className="mt-1 text-xs text-white/50">
              Your favicon will be automatically fetched and displayed
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-left">
            <h3 className="mb-2 text-xs font-semibold text-brand-light">Preview</h3>
            <div className="space-y-1 text-xs text-white/70">
              <p>
                <span className="text-white/50">Name:</span>{" "}
                {businessName || <span className="italic">Your Business Name</span>}
              </p>
              <p>
                <span className="text-white/50">Tagline:</span>{" "}
                {tagline || <span className="italic">Your tagline</span>}
              </p>
              <p>
                <span className="text-white/50">URL:</span>{" "}
                {websiteUrl || <span className="italic">https://example.com</span>}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-light px-8 py-3 text-sm font-bold uppercase tracking-[0.3em] text-[#0f1114] transition hover:bg-brand-light/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Activating..." : "Activate My Sponsorship"}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-xs text-white/50">
            Need help? Contact{" "}
            <a className="text-brand-light hover:underline" href="mailto:support@pbwins.com">
              support@pbwins.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
