/**
 * Test backfill script - processes only a few players for testing
 *
 * Usage: node scripts/test-backfill.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const BROWSERLESS_API_URL = 'http://localhost:3000'; // Use local dev server

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not found in environment');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testBackfillPlayer(player) {
  console.log(`\n--- Testing: ${player.name} ---`);
  console.log(`URL: ${player.duprUrl}`);
  console.log(`Current rating: ${player.duprRating || 'MISSING'}`);
  console.log(`Current verifiedSince: ${player.verifiedSince || 'MISSING'}`);

  try {
    // Call the Browserless API
    console.log('\nCalling Browserless API...');
    const response = await fetch(`${BROWSERLESS_API_URL}/api/dupr-browserless`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: player.duprUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API error:', errorData.error);
      return { success: false, reason: errorData.error };
    }

    const data = await response.json();
    const scrapedPlayer = data.player;

    console.log('\n✓ Scraped data:');
    console.log('  Name:', scrapedPlayer.fullName);
    console.log('  Doubles Rating:', scrapedPlayer.doublesRating);
    console.log('  Singles Rating:', scrapedPlayer.singlesRating);
    console.log('  Wins:', scrapedPlayer.totalWins);
    console.log('  Losses:', scrapedPlayer.totalLosses);
    console.log('  First Match:', scrapedPlayer.verifiedSince);
    console.log('  Years Active:', scrapedPlayer.yearsActive);
    console.log('  Gender:', scrapedPlayer.gender);
    console.log('  Location:', scrapedPlayer.locationRaw);

    console.log('\n✓ Would update database with this data');
    console.log('(Skipping actual update in test mode)');

    return { success: true, data: scrapedPlayer };

  } catch (error) {
    console.log('❌ Error:', error.message);
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log('=== Test Backfill Script ===\n');
  console.log('This will test the backfill process without updating the database.\n');

  // Get all players that need backfilling
  const playersToBackfill = await client.query(api.admin.getPlayersNeedingBackfill);

  console.log(`Found ${playersToBackfill.length} players needing backfill\n`);

  if (playersToBackfill.length === 0) {
    console.log('✓ All players are up to date!');
    return;
  }

  // Test with first 2 players only
  const testPlayers = playersToBackfill.slice(0, 2);
  console.log(`Testing with first ${testPlayers.length} players:\n`);

  for (let i = 0; i < testPlayers.length; i++) {
    const player = testPlayers[i];
    console.log(`\n[${ i + 1}/${testPlayers.length}]`);

    const result = await testBackfillPlayer(player);

    if (result.success) {
      console.log('✅ TEST PASSED');
    } else {
      console.log('❌ TEST FAILED:', result.reason);
    }

    // Wait between requests
    if (i < testPlayers.length - 1) {
      console.log('\nWaiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n=== Test Complete ===');
  console.log('\nIf the test looks good, run the full backfill with:');
  console.log('  node scripts/backfill-player-data.mjs');
}

main()
  .then(() => {
    console.log('\n✓ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
