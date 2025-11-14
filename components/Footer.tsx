"use client";

import Link from "next/link";

const footerLinks = [
  { label: "Submit Ad", href: "mailto:ads@pbwins.com" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] text-sm text-gray-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center text-xs uppercase tracking-[0.4em] text-brand/70">
          © 2025 pbWins — The Database of Verified Pickleball Wins
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/70 transition hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
