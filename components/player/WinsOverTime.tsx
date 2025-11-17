"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { WinRecord } from "@/types/player";

interface WinsOverTimeProps {
  wins: WinRecord[];
}

type TimeRange = "7d" | "4w" | "3m" | "6m" | "12m" | "all";

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "4w", label: "Last 4 weeks" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

interface DataPoint {
  label: string;
  value: number;
  dateRange?: string;
}

function getStartDate(range: TimeRange, now: Date): Date | null {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 7);
      return start;
    case "4w":
      start.setDate(start.getDate() - 28);
      return start;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      return start;
    case "6m":
      start.setMonth(start.getMonth() - 6);
      return start;
    case "12m":
      start.setMonth(start.getMonth() - 12);
      return start;
    case "all":
      return null; // No filter
  }
}

function formatDateLabel(date: Date, range: TimeRange): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  switch (range) {
    case "7d":
      return `${month} ${day}`;
    case "4w":
      return `${month} ${day}`;
    case "3m":
    case "6m":
    case "12m":
      return `${month} ${year}`;
    case "all":
      return year.toString();
  }
}

function aggregateWinsByRange(wins: WinRecord[], range: TimeRange): DataPoint[] {
  const now = new Date();
  const startDate = getStartDate(range, now);

  // Filter wins by date range
  const filteredWins = wins.filter((win) => {
    if (!win.date) return false;
    const winDate = new Date(win.date);
    if (Number.isNaN(winDate.getTime())) return false;
    if (startDate && winDate < startDate) return false;
    return true;
  });

  if (!filteredWins.length) return [];

  const counts: Map<string, { count: number; startDate: Date; endDate: Date }> = new Map();

  filteredWins.forEach((win) => {
    const winDate = new Date(win.date!);
    let key: string;
    let bucketStart: Date;
    let bucketEnd: Date;

    switch (range) {
      case "7d": {
        // Daily buckets
        bucketStart = new Date(winDate);
        bucketStart.setHours(0, 0, 0, 0);
        bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketEnd.getDate() + 1);
        key = bucketStart.toISOString().split("T")[0];
        break;
      }
      case "4w": {
        // Weekly buckets (start on Sunday)
        bucketStart = new Date(winDate);
        bucketStart.setHours(0, 0, 0, 0);
        const day = bucketStart.getDay();
        bucketStart.setDate(bucketStart.getDate() - day);
        bucketEnd = new Date(bucketStart);
        bucketEnd.setDate(bucketEnd.getDate() + 7);
        key = bucketStart.toISOString().split("T")[0];
        break;
      }
      case "3m":
      case "6m":
      case "12m": {
        // Monthly buckets
        bucketStart = new Date(winDate.getFullYear(), winDate.getMonth(), 1);
        bucketEnd = new Date(winDate.getFullYear(), winDate.getMonth() + 1, 1);
        key = `${winDate.getFullYear()}-${String(winDate.getMonth() + 1).padStart(2, "0")}`;
        break;
      }
      case "all": {
        // Yearly buckets
        bucketStart = new Date(winDate.getFullYear(), 0, 1);
        bucketEnd = new Date(winDate.getFullYear() + 1, 0, 1);
        key = winDate.getFullYear().toString();
        break;
      }
    }

    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, { count: 1, startDate: bucketStart, endDate: bucketEnd });
    }
  });

  // Convert to array and sort by date
  const dataPoints: DataPoint[] = Array.from(counts.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([_key, data]) => {
      let dateRange: string;
      if (range === "7d") {
        dateRange = data.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } else if (range === "4w") {
        const endDisplay = new Date(data.endDate);
        endDisplay.setDate(endDisplay.getDate() - 1);
        dateRange = `${data.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDisplay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      } else if (range === "all") {
        dateRange = data.startDate.getFullYear().toString();
      } else {
        dateRange = data.startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }

      return {
        label: formatDateLabel(data.startDate, range),
        value: data.count,
        dateRange,
      };
    });

  return dataPoints;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DataPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-white/60 mb-1">{data.dateRange}</p>
      <p className="text-lg font-semibold text-brand-light">
        {data.value} {data.value === 1 ? "win" : "wins"}
      </p>
    </div>
  );
}

export default function WinsOverTime({ wins }: WinsOverTimeProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const data = useMemo(() => {
    if (!wins?.length) return [];
    return aggregateWinsByRange(wins, timeRange);
  }, [wins, timeRange]);

  if (!wins?.length) {
    return (
      <section className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 text-sm text-white/60">
        No verified wins yet — this player is just getting started.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] p-6 transition-all duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Wins Over Time</h2>

        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="appearance-none rounded-lg border border-white/20 bg-black/60 px-4 py-2 pr-10 text-sm text-white/90 backdrop-blur-sm transition-all duration-200 hover:border-brand-glow/40 hover:bg-black/80 focus:border-brand-glow/60 focus:outline-none focus:ring-2 focus:ring-brand-glow/30"
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--brand-green-glow)" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="var(--brand-green-hex)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--brand-green-glow)" stopOpacity={0.8} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#5f6470"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#ffffff60" }}
              />
              <YAxis
                stroke="#5f6470"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "#ffffff60" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff20", strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{
                  fill: "var(--brand-green-hex)",
                  stroke: "var(--brand-green-glow)",
                  strokeWidth: 2,
                  r: 4,
                  filter: "url(#glow)",
                }}
                activeDot={{
                  fill: "var(--brand-green-glow)",
                  stroke: "var(--brand-green-hex)",
                  strokeWidth: 3,
                  r: 6,
                  filter: "url(#glow)",
                }}
                filter="url(#glow)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center">
          <p className="text-sm text-white/50">No wins in selected time range</p>
        </div>
      )}
    </section>
  );
}
