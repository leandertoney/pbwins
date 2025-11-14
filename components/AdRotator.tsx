"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const ads = [
  {
    title: "Pickleball Central",
    description: "Gear up with championship paddles, apparel, and court essentials.",
    image: "/ads/pickleball-central.jpg",
    url: "https://pickleballcentral.com",
  },
  {
    title: "CourtCrowd",
    description: "Instantly book courts, track lineups, and stream match stats.",
    image: "/ads/courtcrowd.jpg",
    url: "https://courtcrowd.app",
  },
  {
    title: "Netflix Pickleball",
    description: "Watch the official pickleball leagues and documentaries.",
    image: "/ads/netflix-pickleball.jpg",
    url: "https://netflix.com",
  },
];

type AdRotatorProps = {
  className?: string;
  slots?: number;
};

export default function AdRotator({ className = "", slots = 1 }: AdRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const displayAds = useMemo(
    () =>
      Array.from({ length: Math.max(1, slots) }).map((_, slotIndex) => {
        const index = (activeIndex + slotIndex) % ads.length;
        return { ...ads[index], slotIndex };
      }),
    [activeIndex, slots]
  );

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {displayAds.map((ad) => (
        <a
          key={`${ad.title}-${ad.slotIndex}`}
          href={ad.url}
          target="_blank"
          rel="noreferrer"
          className="group relative flex h-52 w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-0 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-brand"
        >
          <Image
            src={ad.image}
            alt={ad.title}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="pointer-events-none object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
          <div className="relative z-10 flex flex-col justify-between p-6 pt-10 text-white">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              Featured Sponsor
            </span>
            <div>
              <h3 className="text-xl font-semibold">{ad.title}</h3>
              <p className="text-sm text-white/70">{ad.description}</p>
            </div>
            <span className="text-sm text-brand">Learn More →</span>
          </div>
        </a>
      ))}
    </div>
  );
}
