"use client";

import { useEffect, useState } from "react";

export default function WinsmasCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2025-12-31T23:59:59");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-6">
          <div className="relative">
            {/* Christmas ornament effect */}
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
              {index === 0 && "🎄"}
              {index === 1 && "🎁"}
              {index === 2 && "⭐"}
              {index === 3 && "🔔"}
            </div>

            <div className="flex flex-col items-center bg-gradient-to-br from-red-600 to-green-700 rounded-2xl p-3 sm:p-5 shadow-2xl border-4 border-white/20 min-w-[70px] sm:min-w-[100px]">
              <div className="text-3xl sm:text-5xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider mt-1">
                {unit.label}
              </div>
            </div>
          </div>

          {index < timeUnits.length - 1 && (
            <div className="text-2xl sm:text-4xl font-bold text-white/60 animate-pulse">
              :
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
