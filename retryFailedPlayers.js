// Script to retry the 4 players that failed during the initial bulk update
const failedPlayers = [
  { name: "Preston Moragne", duprUrl: "https://dashboard.dupr.com/dashboard/player/8092725845" },
  { name: "Sydney Dengler", duprUrl: "https://dashboard.dupr.com/dashboard/player/6614742543" },
  { name: "Dylan Martin", duprUrl: "https://dashboard.dupr.com/dashboard/player/5551449841" },
  { name: "Brandon Wortkotter", duprUrl: "https://dashboard.dupr.com/dashboard/player/7898172167" },
];

async function fetchAndSavePlayer(player) {
  console.log(`\n=== Processing ${player.name} ===`);

  try {
    // Step 1: Fetch DUPR data using optimized scraper (no browser needed!)
    console.log('Fetching DUPR data...');
    const scrapeResponse = await fetch("http://localhost:3000/api/dupr-scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: player.duprUrl }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      console.error(`Failed to fetch DUPR data for ${player.name}:`, scrapeResponse.status, errorData);
      return { success: false, player: player.name, step: 'fetch' };
    }

    const scrapeData = await scrapeResponse.json();

    if (!scrapeData.success || !scrapeData.player) {
      console.error(`Invalid DUPR response for ${player.name}`);
      return { success: false, player: player.name, step: 'fetch' };
    }

    console.log(`✓ Fetched: ${scrapeData.player.fullName}`);
    console.log(`  - Wins: ${scrapeData.player.totalWins}`);
    console.log(`  - Rating: ${scrapeData.player.doublesRating}`);
    console.log(`  - Gender: ${scrapeData.player.gender || 'N/A'}, Birth Year: ${scrapeData.player.birthYear || 'N/A'}`);
    console.log(`  - Location: ${scrapeData.player.locationRaw || 'N/A'}`);

    // Step 2: Save to Convex database
    console.log('Saving to Convex...');
    const saveResponse = await fetch("http://localhost:3000/api/save-player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: scrapeData.player.fullName,
        duprUrl: player.duprUrl,
        wins: scrapeData.player.totalWins,
        rating: scrapeData.player.doublesRating,
        imageUrl: scrapeData.player.imageUrl,
        gender: scrapeData.player.gender,
        birthYear: scrapeData.player.birthYear,
        city: scrapeData.player.city,
        state: scrapeData.player.state,
        country: scrapeData.player.country,
        locationRaw: scrapeData.player.locationRaw,
        losses: scrapeData.player.totalLosses,
        singlesRating: scrapeData.player.singlesRating,
      }),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      console.error(`Failed to save ${player.name} to Convex:`, saveResponse.status, errorData);
      return { success: false, player: player.name, step: 'save' };
    }

    const saveData = await saveResponse.json();
    console.log(`✓ Saved to Convex: ${saveData.message}`);

    return {
      success: true,
      player: player.name,
      duprName: scrapeData.player.fullName,
      wins: scrapeData.player.totalWins,
      rating: scrapeData.player.doublesRating,
    };

  } catch (error) {
    console.error(`Error processing ${player.name}:`, error.message);
    return { success: false, player: player.name, error: error.message };
  }
}

async function retryAll() {
  console.log("=".repeat(60));
  console.log("Retrying failed players with optimized scraper");
  console.log("(No browser sessions - using saved cookies!)");
  console.log("=".repeat(60));

  const results = [];

  for (const player of failedPlayers) {
    const result = await fetchAndSavePlayer(player);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("RETRY SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ Successfully processed: ${successful.length}/${failedPlayers.length} players`);

  if (successful.length > 0) {
    console.log("\nSuccessful updates:");
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.duprName} (was: ${r.player})`);
      console.log(`   Wins: ${r.wins} | Rating: ${r.rating}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`  - ${f.player} (failed at: ${f.step || 'unknown'})`);
      if (f.error) console.log(`    Error: ${f.error}`);
    });
  }

  console.log("\n=== Retry complete! ===");
}

retryAll();
