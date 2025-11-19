"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DIGIT_COUNT = 7;

function formatDigits(value: number) {
  return value.toString().padStart(DIGIT_COUNT, "0").split("");
}

function DigitDisplay({ digit, animate }: { digit: string; animate: boolean }) {
  return (
    <span
      className={`flex aspect-square w-6 items-center justify-center rounded-[30%]
        border border-[#95e84b]/70 bg-gradient-to-b from-[#0b0d10] to-[#020202]
        text-lg font-[700] font-mono tracking-[0.35em] text-[#95e84b]
        shadow-[0_0_15px_rgba(149,232,75,0.4)] transition-transform duration-200
        ${animate ? "ticker-spin" : ""}`}
    >
      {digit}
    </span>
  );
}

export default function VerifiedWinsTicker() {
  const data = useQuery(api.players.getTotalVerifiedWins);
  const value = data?.total ?? 0;
  const [digits, setDigits] = useState<string[]>(() => formatDigits(0));
  const [animatedIndices, setAnimatedIndices] = useState<number[]>([]);

  useEffect(() => {
    const nextDigits = formatDigits(value);
    setDigits((prevDigits) => {
      const changed: number[] = [];
      nextDigits.forEach((digit, index) => {
        if (prevDigits[index] !== digit) {
          changed.push(index);
        }
      });
      if (changed.length > 0) {
        setAnimatedIndices(changed);
      }
      return nextDigits;
    });
  }, [value]);

  useEffect(() => {
    if (!animatedIndices.length) return;
    const timeout = setTimeout(() => setAnimatedIndices([]), 800);
    return () => clearTimeout(timeout);
  }, [animatedIndices]);

  return (
    <>
      <div className="flex flex-col items-end gap-1 text-right text-[#95e84b]">
        <div className="flex items-center gap-1 rounded-full border border-[#95e84b]/50 bg-transparent px-2 py-1 shadow-[0_0_25px_rgba(0,0,0,0.65)] backdrop-blur-xl">
          {digits.map((digit, index) => (
            <DigitDisplay
              key={`ticker-digit-${index}`}
              digit={digit}
              animate={animatedIndices.includes(index)}
            />
          ))}
        </div>
        <div className="text-[0.55rem] uppercase tracking-[0.4em]">
          pbWins verified
        </div>
      </div>
      <style jsx>{`
        @keyframes tickerSpin {
          0% {
            transform: translateY(60%);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20%);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .ticker-spin {
          animation: tickerSpin 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}
