"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WinsmasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WinsmasModal({ isOpen, onClose }: WinsmasModalProps) {
  const [email, setEmail] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const enterContest = useMutation(api.contests.enterContest);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      // Get username from localStorage (if user has verified before)
      const username = typeof window !== "undefined" ? localStorage.getItem("userEmail") || undefined : undefined;
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;

      // Check if we need email
      if (!storedEmail && !email) {
        setNeedsEmail(true);
        setIsSubmitting(false);
        return;
      }

      const finalEmail = email || storedEmail || undefined;

      // Save to Convex
      await enterContest({
        contest: "winsmas",
        username: username,
        email: finalEmail,
        start: "2025-12-01",
      });

      // Save email to localStorage if provided
      if (typeof window !== "undefined" && email && !storedEmail) {
        localStorage.setItem("userEmail", email);
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error("Failed to enter contest:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div
        className="bg-[#0E1414] rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal content */}
        <div className="space-y-6">
          <p className="text-white/90 text-base leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Already on our leaderboard? We auto-count every DUPR win you get in December. No forms. No tracking. Just say yes - we&apos;ll remind you if you climb.
          </p>

          {needsEmail && (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-white/70">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-full bg-red-600 text-white px-6 py-4 font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {isSubmitting ? "Entering..." : "I'm In"}
            </button>

            <p className="text-white/40 text-xs text-center leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Runs all December. First to 25 wins wins. No champ? It rolls to 26 in January.
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
