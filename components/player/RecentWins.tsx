import { WinRecord } from "@/types/player";

interface RecentWinsProps {
  wins: WinRecord[];
}

export default function RecentWins({ wins }: RecentWinsProps) {
  const rows = wins.slice(0, 10);
  if (!rows.length) {
    return (
      <section className="rounded-2xl border border-white/5 bg-black/30 p-6 text-sm text-white/60">
        No wins recorded yet.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-black/30 p-6">
      <h2 className="text-lg font-semibold text-white">Recent wins</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.3em] text-white/50">
            <tr>
              <th className="px-4 py-2">Opponent</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((win, index) => (
              <tr key={win.id ?? index} className="border-t border-white/5">
                <td className="px-4 py-3 text-white/80">{win.opponent || "—"}</td>
                <td className="px-4 py-3 text-white/60">
                  {win.date ? new Date(win.date).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-white/60">{win.location || "—"}</td>
                <td className="px-4 py-3 text-white/60">{win.score || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
