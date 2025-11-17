"use client";

import { useEffect, useState } from "react";

export default function InteractiveCourtCrowdAd() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!isMounted) {
    return null; // SSR safety
  }

  return (
    <tr className="court-crowd-ad-row">
      <td colSpan={4} className="px-4 py-6">
        <a
          href="https://courtcrowd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] p-6 transition-all duration-500 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(149,232,75,0.15)] hover:-translate-y-1 court-crowd-ad-enter"
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-brand/5 rounded-2xl court-crowd-glow" />
          </div>

          {/* Content wrapper */}
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Left: Animation */}
            <div className="flex-shrink-0 w-full md:w-48 h-48 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Phone frame */}
                <div className="relative w-32 h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] border-4 border-gray-700 shadow-2xl overflow-hidden">
                  {/* Screen */}
                  <div className="absolute inset-2 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[0.75rem] overflow-hidden">
                    {/* Map background */}
                    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-600"/>
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#grid)" />
                    </svg>

                    {/* Animated court pins */}
                    {!prefersReducedMotion && !isPaused && (
                      <>
                        {/* Pin 1 */}
                        <div className="absolute top-[20%] left-[30%] court-pin-pulse" style={{ animationDelay: "0s" }}>
                          <div className="relative">
                            <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <span className="text-[0.6rem] font-bold text-black">4</span>
                            </div>
                            <div className="absolute inset-0 bg-brand rounded-full animate-ping opacity-75" />
                          </div>
                        </div>

                        {/* Pin 2 */}
                        <div className="absolute top-[45%] right-[25%] court-pin-pulse" style={{ animationDelay: "0.5s" }}>
                          <div className="relative">
                            <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <span className="text-[0.6rem] font-bold text-black">8</span>
                            </div>
                            <div className="absolute inset-0 bg-brand rounded-full animate-ping opacity-75" />
                          </div>
                        </div>

                        {/* Pin 3 */}
                        <div className="absolute bottom-[25%] left-[40%] court-pin-pulse" style={{ animationDelay: "1s" }}>
                          <div className="relative">
                            <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <span className="text-[0.6rem] font-bold text-black">6</span>
                            </div>
                            <div className="absolute inset-0 bg-brand rounded-full animate-ping opacity-75" />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Static fallback for reduced motion */}
                    {(prefersReducedMotion || isPaused) && (
                      <>
                        <div className="absolute top-[20%] left-[30%]">
                          <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="text-[0.6rem] font-bold text-black">4</span>
                          </div>
                        </div>
                        <div className="absolute top-[45%] right-[25%]">
                          <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="text-[0.6rem] font-bold text-black">8</span>
                          </div>
                        </div>
                        <div className="absolute bottom-[25%] left-[40%]">
                          <div className="w-6 h-6 bg-brand rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <span className="text-[0.6rem] font-bold text-black">6</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Home button */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-brand-light transition-colors duration-300">
                Court Crowd — See Real-Time Pickleball Action
              </h3>
              <p className="text-sm md:text-base text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">
                Know exactly who&apos;s playing at your local courts, instantly.
              </p>

              {/* CTA Button */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-black font-semibold rounded-full transition-all duration-300 group-hover:bg-brand-light group-hover:shadow-[0_0_20px_rgba(149,232,75,0.3)] group-hover:scale-105">
                <span>Check Active Courts Now</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </a>
      </td>

      <style jsx>{`
        @keyframes courtCrowdEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes courtCrowdGlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes courtPinPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .court-crowd-ad-enter {
          animation: courtCrowdEnter 0.75s ease-out forwards;
        }

        .court-crowd-glow {
          animation: courtCrowdGlow 3s ease-in-out infinite;
        }

        .court-pin-pulse {
          animation: courtPinPulse 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .court-crowd-ad-enter,
          .court-crowd-glow,
          .court-pin-pulse {
            animation: none;
          }
        }
      `}</style>
    </tr>
  );
}
