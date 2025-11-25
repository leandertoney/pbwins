"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SponsorCircle from "./SponsorCircle";
import SPONSORS_POOL from "@/data/sponsors";

interface SponsorBarMobileFixedProps {
  idPrefix?: string;
  position: "top" | "bottom";
}

export default function SponsorBarMobileFixed({ idPrefix = "mobile-bar", position }: SponsorBarMobileFixedProps) {
  const currentMonth = useMemo(() => new Date().toLocaleString("en-US", { month: "long" }), []);
  const activeSponsors = useQuery(api.sponsorSlots.getActiveSponsors, { month: currentMonth });
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const sponsors = useMemo(() => {
    if (activeSponsors && activeSponsors.length > 0) {
      return [...activeSponsors, ...SPONSORS_POOL].slice(0, 8);
    }
    return SPONSORS_POOL.slice(0, 8);
  }, [activeSponsors]);

  // Gently auto-scroll the sponsor bar on mobile while still allowing manual scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number;
    let lastTs: number | null = null;
    const speed = 30; // px per second

    const step = (ts: number) => {
      if (lastTs != null) {
        const deltaSeconds = (ts - lastTs) / 1000;
        const maxScroll = container.scrollWidth - container.clientWidth;

        if (maxScroll > 0) {
          container.scrollLeft += speed * deltaSeconds;

          if (container.scrollLeft >= maxScroll - 1) {
            container.scrollLeft = 0;
          }
        }
      }
      lastTs = ts;
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [sponsors.length]);

  return (
    <div
      className={`lg:hidden fixed ${position === "top" ? "top-0" : "bottom-0"} inset-x-0 z-50 border-b border-white/10`}
      style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(8px)" }}
    >
      <div ref={scrollContainerRef} className="w-full overflow-x-auto px-3 py-2">
        <div className="flex gap-3 justify-center">
          {sponsors.map((sponsor, idx) => (
            <div key={`${idPrefix}-${position}-${idx}`} className="flex-shrink-0">
              <div className="scale-75 origin-center">
                <SponsorCircle slotIndex={idx} sponsor={sponsor} idPrefix={`${idPrefix}-${position}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
