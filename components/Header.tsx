"use client";

import VerifiedWinsTicker from "./VerifiedWinsTicker";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[95vw] items-center justify-center gap-4 px-4 py-3 lg:max-w-[90vw] lg:px-6">
        {/* Ticker - Centered */}
        <VerifiedWinsTicker />
      </div>
    </header>
  );
}
