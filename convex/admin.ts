import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Delete all players (use with caution!)
export const deleteAllPlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }
    return { success: true, deleted: players.length };
  },
});

// Delete players with "Unknown Player" or 0 wins
export const cleanupInvalidPlayers = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let deleted = 0;

    for (const player of players) {
      if (player.name === "Unknown Player" || player.wins === 0) {
        await ctx.db.delete(player._id);
        deleted++;
      }
    }

    return { success: true, deleted };
  },
});

// Get all players (for debugging)
export const getAllPlayersDebug = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});
