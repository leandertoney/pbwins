"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminPage() {
  const players = useQuery(api.admin.getAllPlayersDebug);
  const cleanupInvalidPlayers = useMutation(api.admin.cleanupInvalidPlayers);
  const deleteAllPlayers = useMutation(api.admin.deleteAllPlayers);

  const handleCleanup = async () => {
    if (confirm("Delete all players with 'Unknown Player' name or 0 wins?")) {
      const result = await cleanupInvalidPlayers();
      alert(`Deleted ${result.deleted} invalid players`);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("⚠️ DELETE ALL PLAYERS? This cannot be undone!")) {
      const result = await deleteAllPlayers();
      alert(`Deleted ${result.deleted} players`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleCleanup}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
          >
            Clean Up Invalid Players
          </button>

          <button
            onClick={handleDeleteAll}
            className="ml-4 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Delete All Players
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">All Players ({players?.length || 0})</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2">Name</th>
                <th className="pb-2">Slug</th>
                <th className="pb-2">Rating</th>
                <th className="pb-2">Wins</th>
                <th className="pb-2">DUPR URL</th>
              </tr>
            </thead>
            <tbody>
              {players?.map((player) => (
                <tr
                  key={player._id}
                  className={`border-b border-gray-800 ${
                    player.name === "Unknown Player" || player.wins === 0
                      ? "bg-red-900/20"
                      : ""
                  }`}
                >
                  <td className="py-2">{player.name}</td>
                  <td className="py-2 text-gray-400">{player.slug}</td>
                  <td className="py-2">{player.rating}</td>
                  <td className="py-2">{player.wins}</td>
                  <td className="py-2 text-xs text-gray-500 truncate max-w-xs">
                    {player.duprUrl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
