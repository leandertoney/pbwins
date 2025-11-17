import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const isProRating = (rating?: number | null) => typeof rating === "number" && rating >= 5.2;

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

export const recalculateProStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let updated = 0;
    for (const player of players) {
      const rating = player.rating ?? player.singlesRating;
      const nextIsPro = isProRating(rating);
      if (player.isPro !== nextIsPro) {
        await ctx.db.patch(player._id, { isPro: nextIsPro });
        updated += 1;
      }
    }
    return { updated };
  },
});
