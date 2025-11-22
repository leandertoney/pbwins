"use client";

import { useState } from "react";

interface UpgradeModalProps {
  onClose: () => void;
  userEmail: string | null;
}

export default function UpgradeModal({ onClose, userEmail }: UpgradeModalProps) {
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
          <p className="text-white/70 mb-4">Unlock full access to pbWins:</p>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>See real player names on all leaderboards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>View exact rank positions site-wide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>Weekly email alerts when you move up</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand mt-0.5">✓</span>
              <span>Join challenges like Winsmas for free</span>
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
