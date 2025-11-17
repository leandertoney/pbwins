"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const footerLinks = [
  { label: "Contact", href: "mailto:support@pbwins.com" },
];

export default function Footer() {
  const [showAdvertise, setShowAdvertise] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => setShowAdvertise(true);
    window.addEventListener("open-sponsor-modal", handler);
    return () => window.removeEventListener("open-sponsor-modal", handler);
  }, []);

  const handleCheckout = async () => {
    if (!email) {
      alert("Enter an email to continue.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe!.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      alert("Unable to start checkout. Please try again.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <footer className="border-t border-white/10 bg-[#050505] text-sm text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs uppercase tracking-[0.4em] text-white/60">
            Designed and developed by UNIVERSOLE APP STUDIOS —&nbsp;
            <Link
              href="https://universalappstudios.com"
              className="text-brand font-semibold hover:text-brand-light"
              target="_blank"
              rel="noreferrer"
            >
              universalappstudios.com
            </Link>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/70 transition hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setShowAdvertise(true)}
              className="cursor-pointer text-white/70 transition hover:text-brand"
            >
              Advertise
            </button>
          </div>
        </div>
      </footer>

      {showAdvertise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e1013] p-6 text-left text-sm text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Advertise on pbWins</h2>
              <button
                onClick={() => setShowAdvertise(false)}
                className="text-white/60 transition hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-base text-gray-300">
              Reach thousands of active pickleball players every single day.
            </p>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-white/80">How it works</p>
              <p className="mt-2 text-xs text-white/60">
                Your brand appears in rotating sponsor circles across desktop and mobile.
              </p>
              <p className="mt-1 text-xs text-white/60">
                Ads rotate every 10 seconds and appear beside the live leaderboard for high visibility.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-1 text-sm text-gray-300">
              <p className="text-lg font-semibold text-white">Early Access Pricing (50% OFF)</p>
              <p>
                Our standard rate for sidebar placements is{" "}
                <span className="line-through text-gray-400">$999/month</span>.
              </p>
              <p>
                During our early launch, you can lock a lifetime rate of{" "}
                <span className="text-brand-light font-semibold">$499/month</span> — guaranteed for as long as you keep your spot.
              </p>
              <p className="mt-3 text-lg font-semibold text-white">Availability</p>
              <p>• 20 total sponsor slots</p>
              <p>• 1 spot already claimed</p>
              <p>• 19 spots left for December</p>
              <p>• Placements begin December 1</p>
              <p className="mt-3 text-lg font-semibold text-white">Reserve Your Spot</p>
              <p>Pay $499 today to secure your December placement.</p>
              <p>Your payment covers your first month and guarantees your spot before the rotation fills.</p>
              <p className="mt-3 text-lg font-semibold text-white">Guarantee</p>
              <p>
                If your ad doesn’t receive meaningful impressions in December, we extend your placement at no extra cost until it performs.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none"
              />
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-full border border-brand/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-light transition hover:bg-brand/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Lock Your Spot — $499"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
