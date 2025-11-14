// Script to update Convex database with verified DUPR data
const players = [
  { name: "Leander Toney Jr", duprUrl: "https://dashboard.dupr.com/dashboard/player/8309056801", wins: 120, rating: 4.445, imageUrl: null },
  { name: "Justin Villa", duprUrl: "https://dashboard.dupr.com/dashboard/player/7987518948", wins: 68, rating: 4.146, imageUrl: null },
  { name: "Mike Donovan", duprUrl: "https://dashboard.dupr.com/dashboard/player/6340005761", wins: 66, rating: 3.914, imageUrl: null },
  { name: "Maurice Oldham", duprUrl: "https://dashboard.dupr.com/dashboard/player/5051917063", wins: 59, rating: 4.023, imageUrl: null },
  { name: "Paul Musi Jr", duprUrl: "https://dashboard.dupr.com/dashboard/player/4324377581", wins: 43, rating: 4.295, imageUrl: null },
  { name: "Michael Deihl", duprUrl: "https://dashboard.dupr.com/dashboard/player/4330385033", wins: 39, rating: 3.781, imageUrl: null },
  { name: "Sylvan Stoltzfoos", duprUrl: "https://dashboard.dupr.com/dashboard/player/7067989952", wins: 17, rating: 3.920, imageUrl: null },
  { name: "Travis Yoder", duprUrl: "https://dashboard.dupr.com/dashboard/player/5315725437", wins: 14, rating: 5.053, imageUrl: null },
  { name: "Chandler Gillman", duprUrl: "https://dashboard.dupr.com/dashboard/player/6441204853", wins: 6, rating: 3.544, imageUrl: null },
  { name: "John Lapp", duprUrl: "https://dashboard.dupr.com/dashboard/player/7692006222", wins: 4, rating: 3.525, imageUrl: null },
];

async function updateConvexPlayer(player) {
  console.log(`\n=== Updating ${player.name} in Convex ===`);

  try {
    const response = await fetch("http://localhost:3000/api/save-player", {
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to update ${player.name}:`, response.status, errorData);
      return { success: false, player: player.name };
    }

    const data = await response.json();
    console.log(`✓ ${player.name}: ${data.message}`);
    return { success: true, player: player.name, updated: data.updated };
  } catch (error) {
    console.error(`Error updating ${player.name}:`, error.message);
    return { success: false, player: player.name };
  }
}

async function updateAllConvex() {
  console.log("=".repeat(60));
  console.log("Updating Convex database with verified DUPR data");
  console.log("=".repeat(60));

  const results = [];

  for (const player of players) {
    const result = await updateConvexPlayer(player);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n" + "=".repeat(60));
  console.log("CONVEX UPDATE SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => r.success);
  const updated = successful.filter(r => r.updated);
  const created = successful.filter(r => !r.updated);

  console.log(`\n✓ Successfully processed: ${successful.length}/${players.length} players`);
  console.log(`  - Updated existing: ${updated.length}`);
  console.log(`  - Created new: ${created.length}`);

  if (successful.length < players.length) {
    const failed = results.filter(r => !r.success);
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(f => console.log(`  - ${f.player}`));
  }

  console.log("\n=== Convex update complete! ===");
}

updateAllConvex();
