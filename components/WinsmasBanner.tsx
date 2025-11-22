"use client";

import Link from "next/link";

export default function WinsmasBanner() {
  return (
    <>
      {/* Premium festive banner */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-[#1a0a0f] via-[#0f1a14] to-[#1a0a0f] border-b border-white/5 shadow-xl overflow-hidden">
        <div className="relative">
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>

          {/* Minimal festive accents */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <span className="absolute left-[5%] top-3 text-amber-400/40 text-xs">✦</span>
            <span className="absolute left-[25%] top-2 text-amber-300/30 text-xs">✦</span>
            <span className="absolute left-[75%] top-3 text-amber-400/40 text-xs">✦</span>
            <span className="absolute left-[95%] top-2 text-amber-300/30 text-xs">✦</span>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-amber-400/60 text-lg">✦</span>
              <p className="text-white/90 text-sm sm:text-base font-medium tracking-wide">
                <span className="text-amber-300/90 font-semibold">Winsmas Challenge</span>
                <span className="hidden sm:inline text-white/50 mx-2">·</span>
                <span className="hidden sm:inline text-white/70">First to 25 wins in December wins a Gen 3 Paddle</span>
              </p>
            </div>

            <Link
              href="/winsmas"
              className="group relative px-4 sm:px-6 py-2 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/30 rounded-lg text-amber-100 text-sm font-medium tracking-wide hover:border-amber-400/50 hover:from-amber-600/30 hover:to-amber-500/30 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Learn More
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
