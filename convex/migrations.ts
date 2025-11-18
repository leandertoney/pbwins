import { mutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type PlayerDoc = Doc<"players">;

// Migration to remove the deprecated 'age' field from all player records
export const removeAgeField = mutation({
  args: {},
  handler: async (ctx) => {
    const players: PlayerDoc[] = await ctx.db.query("players").collect();
    let migratedCount = 0;

    for (const player of players) {
      if ("age" in player) {
        await ctx.db.patch(player._id, { age: undefined });
        migratedCount++;
        console.log(`Migrated ${player.name}: removed age field`);
      }
    }

    return {
      success: true,
      migratedCount,
      totalPlayers: players.length,
      message: `Migrated ${migratedCount} out of ${players.length} players`
    };
  },
});
