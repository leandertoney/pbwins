/**
 * Backfill script to update all players with:
 * 1. DUPR ratings (if missing)
 * 2. First match date / verified since (if missing)
 * 3. Years active calculation
 *
 * Usage: node scripts/backfill-player-data.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
// Try localhost first, fallback to production
const BROWSERLESS_API_URL = 'http://localhost:3000';

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not found in environment');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function backfillPlayer(player) {
  console.log(`\n--- Backfilling: ${player.name} ---`);
  console.log(`Current rating: ${player.duprRating || 'MISSING'}`);
  console.log(`Current verifiedSince: ${player.verifiedSince || 'MISSING'}`);

  // Extract player ID from DUPR URL
  const match = player.duprUrl.match(/player\/(\d+)/);
  if (!match) {
    console.log('❌ Invalid DUPR URL format');
    return { success: false, reason: 'Invalid URL' };
  }

  try {
    // Call the Browserless API to scrape fresh data
    const apiUrl = `${BROWSERLESS_API_URL}/api/dupr-browserless`;
    console.log(`Calling: ${apiUrl}`);

    const response = await fetch(apiUrl, {
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

    console.log('✓ Scraped data:');
    console.log('  - Name:', scrapedPlayer.fullName);
    console.log('  - Doubles Rating:', scrapedPlayer.doublesRating);
    console.log('  - Singles Rating:', scrapedPlayer.singlesRating);
    console.log('  - Wins:', scrapedPlayer.totalWins);
    console.log('  - Losses:', scrapedPlayer.totalLosses);
    console.log('  - First Match:', scrapedPlayer.verifiedSince);
    console.log('  - Years Active:', scrapedPlayer.yearsActive);

    // Update the player in Convex
    await client.mutation(api.players.savePlayer, {
      name: scrapedPlayer.fullName || player.name,
      duprUrl: player.duprUrl,
      wins: scrapedPlayer.totalWins || player.wins,
      rating: scrapedPlayer.doublesRating || player.duprRating || 0,
      duprRating: scrapedPlayer.doublesRating,
      imageUrl: scrapedPlayer.imageUrl,
      gender: scrapedPlayer.gender,
      birthYear: scrapedPlayer.birthYear,
      city: scrapedPlayer.city,
      state: scrapedPlayer.state,
      country: scrapedPlayer.country,
      locationRaw: scrapedPlayer.locationRaw,
      losses: scrapedPlayer.totalLosses,
      singlesRating: scrapedPlayer.singlesRating,
      verifiedSince: scrapedPlayer.verifiedSince,
      yearsActive: scrapedPlayer.yearsActive,
    });

    console.log('✓ Updated in database');
    return { success: true };

  } catch (error) {
    console.log('❌ Error:', error.message);
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log('=== Player Data Backfill Script ===\n');
  console.log('Fetching players needing backfill...\n');

  // Get all players that need backfilling
  const playersToBackfill = await client.query(api.admin.getPlayersNeedingBackfill);

  console.log(`Found ${playersToBackfill.length} players needing backfill:\n`);

  if (playersToBackfill.length === 0) {
    console.log('✓ All players are up to date!');
    return;
  }

  // Show list
  playersToBackfill.forEach((p, i) => {
    const missing = [];
    if (!p.duprRating) missing.push('rating');
    if (!p.verifiedSince) missing.push('verified date');
    console.log(`${i + 1}. ${p.name} - Missing: ${missing.join(', ')}`);
  });

  console.log('\n=== Starting Backfill ===');

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < playersToBackfill.length; i++) {
    const player = playersToBackfill[i];
    console.log(`\nProgress: ${i + 1}/${playersToBackfill.length}`);

    const result = await backfillPlayer(player);

    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        player: player.name,
        reason: result.reason,
      });
    }

    // Rate limiting: wait 3 seconds between requests
    if (i < playersToBackfill.length - 1) {
      console.log('Waiting 3 seconds before next player...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n=== Backfill Complete ===');
  console.log(`✓ Successfully updated: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => {
      console.log(`  - ${err.player}: ${err.reason}`);
    });
  }
}

main()
  .then(() => {
    console.log('\n✓ Script complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
