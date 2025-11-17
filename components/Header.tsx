"use client";

import Link from "next/link";
import VerifiedWinsTicker from "./VerifiedWinsTicker";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[95vw] items-center justify-between gap-4 px-4 py-3 lg:max-w-[90vw] lg:px-6">
        {/* Logo/Brand - Left side on desktop */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white transition hover:text-brand md:text-xl"
        >
          pb<span className="text-brand">Wins</span>
        </Link>

        {/* Ticker - Right side on desktop, full width on mobile */}
        <div className="flex items-center">
          <VerifiedWinsTicker />
        </div>
      </div>

      {/* Mobile ticker - centered row below nav */}
      <div className="flex justify-center border-t border-white/5 py-2 md:hidden">
        <VerifiedWinsTicker />
      </div>
    </header>
  );
}
