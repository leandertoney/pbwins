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

  const formatDigitalNumber = (num: number): string => {
    // Pad number to 7 digits with leading zeros
    return num.toString().padStart(7, "0");
  };

  const displayValue = data?.total !== undefined ? formatDigitalNumber(data.total) : "0000000";

  return (
    <div
      className={`
        group flex items-center gap-3
        rounded-lg border border-white/10 bg-black/40
        px-4 py-2 backdrop-blur-sm
        transition-all duration-300
        hover:shadow-[0_0_10px_rgba(0,255,150,0.15)]
        ${shouldPulse ? "animate-pulse scale-105" : ""}
      `}
    >
      <Award className="h-4 w-4 md:h-5 md:w-5 text-yellow-400/80 group-hover:text-yellow-400" />
      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-white/50 font-medium">pbWins:</span>
        <div className="flex gap-0.5 font-mono text-lg md:text-xl font-bold tracking-wider">
          {displayValue.split("").map((digit, index) => (
            <span
              key={index}
              className="inline-flex h-7 w-4 md:h-8 md:w-5 items-center justify-center rounded bg-black/60 text-brand shadow-inner"
              style={{
                textShadow: "0 0 8px rgba(149, 232, 75, 0.6)",
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
