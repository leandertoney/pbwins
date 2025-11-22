"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WinsmasBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide banner when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Festive ticker-style banner */}
      <div
        data-winsmas-banner
        className={`sticky top-0 z-40 bg-red-600 shadow-lg overflow-hidden transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative h-12 flex items-center">
          {/* Animated holiday emojis background */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute left-[10%] top-2 text-white/40 animate-pulse">❄️</span>
            <span className="absolute left-[30%] top-1 text-white/50 animate-pulse" style={{ animationDelay: '0.5s' }}>🎄</span>
            <span className="absolute left-[50%] top-3 text-white/40 animate-pulse" style={{ animationDelay: '1s' }}>❄️</span>
            <span className="absolute left-[70%] top-1 text-white/50 animate-pulse" style={{ animationDelay: '1.5s' }}>🎁</span>
            <span className="absolute left-[90%] top-2 text-white/40 animate-pulse" style={{ animationDelay: '2s' }}>⭐</span>
          </div>

          {/* Scrolling ticker content */}
          <div className="relative flex items-center w-full animate-marquee whitespace-nowrap">
            <span className="inline-flex items-center gap-3 text-white font-bold text-sm sm:text-base tracking-wide px-4">
              🎄 WINSMAS: First to 25 verified wins in December wins a Gen 3 Paddle 🎁
              <Link
                href="/winsmas"
                className="inline-flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-green-600 hover:text-white transition-colors shadow-md"
              >
                Enter Now ⛄
              </Link>
            </span>
            {/* Duplicate for seamless loop */}
            <span className="inline-flex items-center gap-3 text-white font-bold text-sm sm:text-base tracking-wide px-4">
              🎄 WINSMAS: First to 25 verified wins in December wins a Gen 3 Paddle 🎁
              <Link
                href="/winsmas"
                className="inline-flex items-center gap-1.5 bg-white text-red-600 px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-green-600 hover:text-white transition-colors shadow-md"
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
