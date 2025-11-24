"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import SponsorCircle from "./SponsorCircle";
import SPONSORS_POOL from "@/data/sponsors";

interface SponsorRailMobileProps {
  idPrefix?: string;
  className?: string;
}

/**
 * Mobile-only horizontal sponsor strip.
 * Shows a simple scroll row of sponsor circles (no rotation) using the same data as desktop rails.
 */
export default function SponsorRailMobile({ idPrefix = "mobile-sponsor", className = "" }: SponsorRailMobileProps) {
  const currentMonth = useMemo(() => new Date().toLocaleString("en-US", { month: "long" }), []);
  const activeSponsors = useQuery(api.sponsorSlots.getActiveSponsors, { month: currentMonth });

  const sponsors = useMemo(() => {
    if (activeSponsors && activeSponsors.length > 0) {
      return [...activeSponsors, ...SPONSORS_POOL].slice(0, 10);
    }
    return SPONSORS_POOL.slice(0, 10);
  }, [activeSponsors]);

  return (
    <div className={`lg:hidden w-full overflow-x-auto px-4 py-3 ${className}`}>
      <div className="flex gap-3">
        {sponsors.map((sponsor, idx) => (
          <div key={`${idPrefix}-${idx}`} className="flex-shrink-0">
            <div className="scale-75 origin-center">
              <SponsorCircle slotIndex={idx} sponsor={sponsor} idPrefix={idPrefix} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
