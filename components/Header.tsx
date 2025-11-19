"use client";

import VerifiedWinsTicker from "./VerifiedWinsTicker";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex max-w-[95vw] justify-end px-4 py-3 pr-10 lg:max-w-[90vw] lg:px-6 lg:pr-32">
        <VerifiedWinsTicker />
      </div>
    </header>
  );
}
