// Migration script to remove the deprecated 'age' field from all player records
async function migrateAllPlayers() {
  console.log("=".repeat(60));
  console.log("Migrating player records: removing 'age' field");
  console.log("=".repeat(60));

  try {
    // Fetch all players from the database
    const response = await fetch("http://localhost:3000/api/get-all-players");
    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.status}`);
    }

    const players = await response.json();
    console.log(`\nFound ${players.length} players to check`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const player of players) {
      // Only update if the player has the old 'age' field
      if (player.age !== undefined) {
        console.log(`\nMigrating ${player.name}...`);
        console.log(`  - Old age: ${player.age}`);
        console.log(`  - Birth year: ${player.birthYear || 'N/A'}`);

        // Re-save the player to trigger the update
        const saveResponse = await fetch("http://localhost:3000/api/save-player", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: player.name,
            duprUrl: player.duprUrl,
            wins: player.wins,
            rating: player.rating,
            imageUrl: player.imageUrl,
            gender: player.gender,
            birthYear: player.birthYear,
            city: player.city,
            state: player.state,
            country: player.country,
            locationRaw: player.locationRaw,
            losses: player.losses,
            singlesRating: player.singlesRating,
          }),
        });

        if (saveResponse.ok) {
          console.log(`  ✓ Migrated successfully`);
          migratedCount++;
        } else {
          console.log(`  ✗ Failed to migrate`);
        }
      } else {
        skippedCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("\n" + "=".repeat(60));
    console.log("MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✓ Migrated: ${migratedCount} players`);
    console.log(`- Skipped (already migrated): ${skippedCount} players`);
    console.log("\n=== Migration complete! ===");

  } catch (error) {
    console.error("\n✗ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateAllPlayers();
