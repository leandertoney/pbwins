import { mutation } from "./_generated/server";

// Migration to remove the deprecated 'age' field from all player records
export const removeAgeField = mutation({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db.query("players").collect();
    let migratedCount = 0;

    for (const player of players) {
      // Check if the player has the old 'age' field
      if ('age' in player) {
        // Patch the player to remove the age field by setting all other fields
        await ctx.db.patch(player._id, {
          name: player.name,
          slug: player.slug,
          duprUrl: player.duprUrl,
          wins: player.wins,
          rating: player.rating,
          verified: player.verified,
          createdAt: player.createdAt,
          imageUrl: player.imageUrl,
          gender: player.gender,
          birthYear: player.birthYear,
          city: player.city,
          state: player.state,
          country: player.country,
          locationRaw: player.locationRaw,
          losses: player.losses,
          singlesRating: player.singlesRating,
        });
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
