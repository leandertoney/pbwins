"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Award } from "lucide-react";
import { useEffect, useState } from "react";

export default function VerifiedWinsTicker() {
  const data = useQuery(api.players.getTotalVerifiedWins);
  const [prevTotal, setPrevTotal] = useState<number | null>(null);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (data?.total !== undefined) {
      // Trigger pulse animation when total increases
      if (prevTotal !== null && data.total > prevTotal) {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 1000);
      }
      setPrevTotal(data.total);
    }
  }, [data?.total, prevTotal]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString("en-US");
  };

  return (
    <div
      className={`
        group flex items-center gap-2
        rounded-full border border-white/10 bg-white/5
        px-3 py-1 backdrop-blur-sm
        text-xs md:text-sm text-white/70
        transition-all duration-300
        hover:text-white hover:shadow-[0_0_10px_rgba(0,255,150,0.15)]
        ${shouldPulse ? "animate-pulse scale-105" : ""}
      `}
    >
      <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-400/80 group-hover:text-yellow-400" />
      <span className="whitespace-nowrap font-medium">
        pbWins Verified Total: {data?.total !== undefined ? formatNumber(data.total) : "…"}
      </span>
    </div>
  );
}
