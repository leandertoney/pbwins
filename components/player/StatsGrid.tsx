interface StatItem {
  label: string;
  value: string;
  subLabel?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="rounded-2xl border border-white/5 bg-black/30 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-4 shadow-inner"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            {stat.subLabel && <p className="text-xs text-white/60">{stat.subLabel}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
