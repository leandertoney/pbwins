"use client";

import VerifiedWinsTicker from "./VerifiedWinsTicker";

export default function Header() {
  return (
    <header className="bg-transparent">
      <div className="mx-auto flex max-w-[100vw] md:max-w-[95vw] justify-center md:justify-end px-2 md:px-4 py-2 md:pr-10 lg:max-w-[90vw] lg:px-6 lg:pr-32">
        <VerifiedWinsTicker />
      </div>
    </header>
  );
}
