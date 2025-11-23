// Script to update all players with accurate data using new Browserless + DUPR API scraper
const players = [
  { name: "Leander Toney Jr", duprUrl: "https://dashboard.dupr.com/dashboard/player/8309056801" },
  { name: "Preston Moragne", duprUrl: "https://dashboard.dupr.com/dashboard/player/8092725845" },
  { name: "Justin Villa", duprUrl: "https://dashboard.dupr.com/dashboard/player/7987518948" },
  { name: "Mike Donovan", duprUrl: "https://dashboard.dupr.com/dashboard/player/6340005761" },
  { name: "Maurice Oldham", duprUrl: "https://dashboard.dupr.com/dashboard/player/5051917063" },
  { name: "Sydney Dengler", duprUrl: "https://dashboard.dupr.com/dashboard/player/6614742543" },
  { name: "Paul Musi", duprUrl: "https://dashboard.dupr.com/dashboard/player/4324377581" },
  { name: "Michael Deihl", duprUrl: "https://dashboard.dupr.com/dashboard/player/4330385033" },
  { name: "Dylan Martin", duprUrl: "https://dashboard.dupr.com/dashboard/player/5551449841" },
  { name: "Sylvan Stoltzfoos", duprUrl: "https://dashboard.dupr.com/dashboard/player/7067989952" },
  { name: "Travis Yoder", duprUrl: "https://dashboard.dupr.com/dashboard/player/5315725437" },
  { name: "Brandon Wortkotter", duprUrl: "https://dashboard.dupr.com/dashboard/player/7898172167" },
  { name: "Chandler Gillman", duprUrl: "https://dashboard.dupr.com/dashboard/player/6441204853" },
  { name: "John Lapp", duprUrl: "https://dashboard.dupr.com/dashboard/player/7692006222" },
];

async function updatePlayer(player) {
  console.log(`\n=== Updating ${player.name} ===`);

  try {
    // Step 1: Fetch DUPR data
    const scrapeResponse = await fetch("http://localhost:3000/api/dupr-scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: player.duprUrl }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      console.error(`Failed to fetch data for ${player.name}:`, scrapeResponse.status, errorData);
      return { success: false, player: player.name, step: 'fetch' };
    }

    const scrapeData = await scrapeResponse.json();

    if (!scrapeData.success || !scrapeData.player) {
      console.error(`Invalid response for ${player.name}`);
      return { success: false, player: player.name, step: 'fetch' };
    }

    console.log(`✓ Fetched: ${scrapeData.player.fullName}`);
    console.log(`  - Wins: ${scrapeData.player.totalWins}`);
    console.log(`  - Rating: ${scrapeData.player.doublesRating}`);
    console.log(`  - Gender: ${scrapeData.player.gender || 'N/A'}, Birth Year: ${scrapeData.player.birthYear || 'N/A'}`);
    console.log(`  - Location: ${scrapeData.player.locationRaw || 'N/A'}`);
    console.log(`  - Verified Since: ${scrapeData.player.verifiedSince || 'N/A'}, Years Active: ${scrapeData.player.yearsActive || 'N/A'}`);

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
        verifiedSince: scrapeData.player.verifiedSince,
        yearsActive: scrapeData.player.yearsActive,
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
      gender: scrapeData.player.gender,
      birthYear: scrapeData.player.birthYear,
      location: scrapeData.player.locationRaw,
    };
  } catch (error) {
    console.error(`Error updating ${player.name}:`, error.message);
    return { success: false, player: player.name, error: error.message };
  }
}

async function updateAll() {
  console.log("=".repeat(60));
  console.log("Updating all players with demographic data");
  console.log("=".repeat(60));

  const results = [];

  for (const player of players) {
    const result = await updatePlayer(player);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("UPDATE SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ Successfully updated: ${successful.length}/${players.length} players`);

  if (successful.length > 0) {
    console.log("\nUpdated players:");
    successful.forEach((r, i) => {
      console.log(`${i + 1}. ${r.duprName} (was: ${r.player})`);
      console.log(`   Wins: ${r.wins} | Rating: ${r.rating}`);
      console.log(`   ${r.gender || 'N/A'} | Birth Year: ${r.birthYear || 'N/A'} | ${r.location || 'N/A'}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(f => {
      console.log(`  - ${f.player} (failed at: ${f.step || 'unknown'})`);
      if (f.error) console.log(`    Error: ${f.error}`);
    });
  }

  console.log("\n=== Update complete! ===");
}

updateAll();
