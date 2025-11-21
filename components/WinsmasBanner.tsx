"use client";

import Link from "next/link";

export default function WinsmasBanner() {
  return (
    <>
      {/* Festive ticker-style banner */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-green-600 to-red-600 shadow-lg overflow-hidden">
        <div className="relative h-12 flex items-center">
          {/* Animated snowflakes background */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute left-[10%] top-2 text-white/30 animate-pulse">❄️</span>
            <span className="absolute left-[30%] top-1 text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</span>
            <span className="absolute left-[50%] top-3 text-white/30 animate-pulse" style={{ animationDelay: '1s' }}>❄️</span>
            <span className="absolute left-[70%] top-1 text-white/20 animate-pulse" style={{ animationDelay: '1.5s' }}>❄️</span>
            <span className="absolute left-[90%] top-2 text-white/30 animate-pulse" style={{ animationDelay: '2s' }}>❄️</span>
          </div>

          {/* Scrolling ticker content */}
          <div className="relative flex items-center w-full animate-marquee whitespace-nowrap">
            <span className="inline-flex items-center gap-3 text-white font-bold text-sm sm:text-base tracking-wide px-4">
              🎄 WINSMAS: First to 25 verified wins in December wins a Gen 3 Paddle 🎁
              <Link
                href="/winsmas"
                className="inline-flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors shadow-md"
              >
                Enter Now ⛄
              </Link>
            </span>
            {/* Duplicate for seamless loop */}
            <span className="inline-flex items-center gap-3 text-white font-bold text-sm sm:text-base tracking-wide px-4">
              🎄 WINSMAS: First to 25 verified wins in December wins a Gen 3 Paddle 🎁
              <Link
                href="/winsmas"
                className="inline-flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors shadow-md"
              >
                Enter Now ⛄
              </Link>
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
