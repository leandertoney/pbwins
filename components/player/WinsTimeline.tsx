"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WinRecord } from "@/types/player";

interface WinsTimelineProps {
  wins: WinRecord[];
}

export default function WinsTimeline({ wins }: WinsTimelineProps) {
  const data = useMemo(() => {
    if (!wins?.length) return [];
    const counts: Record<string, number> = {};
    wins.forEach((win) => {
      if (!win.date) return;
      const date = new Date(win.date);
      if (Number.isNaN(date.getTime())) return;
      const label = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([label, value]) => ({ label, value }));
  }, [wins]);

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-white/5 bg-black/40 p-6 text-sm text-white/60">
        No verified wins yet — this player is just getting started.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-black/40 p-6">
      <h2 className="text-lg font-semibold text-white">Wins over time</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="winsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-green-hex)" stopOpacity={0.8} />
            <stop offset="100%" stopColor="var(--brand-green-hex)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" stroke="#5f6470" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#5f6470" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#111", borderRadius: 12, border: "1px solid #222" }}
              labelStyle={{ color: "#fff" }}
            />
            <Area type="monotone" dataKey="value" stroke="var(--brand-green-hex)" fill="url(#winsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
