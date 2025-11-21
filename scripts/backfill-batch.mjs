/**
 * Batch backfill script - process N players at a time
 *
 * Usage: node scripts/backfill-batch.mjs [batch_size]
 * Example: node scripts/backfill-batch.mjs 10  (processes first 10 players)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
// Try different ports since Next.js may use 3000 or 3001
const BROWSERLESS_API_URL = process.env.API_URL || 'http://localhost:3001';

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not found in environment');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Get batch size from command line args (default: 5)
const BATCH_SIZE = parseInt(process.argv[2]) || 5;

async function backfillPlayer(player) {
  console.log(`\n--- ${player.name} ---`);

  try {
    const apiUrl = `${BROWSERLESS_API_URL}/api/dupr-browserless`;

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
      if (errorData.details) {
        console.log('   Details:', errorData.details);
      }
      return { success: false, reason: errorData.details || errorData.error };
    }

    const data = await response.json();
    const scrapedPlayer = data.player;

    console.log('✓ Rating:', scrapedPlayer.doublesRating);
    console.log('✓ First Match:', scrapedPlayer.verifiedSince);
    console.log('✓ Years Active:', scrapedPlayer.yearsActive);

    // Update the player in Convex
    const updateData = {
      name: scrapedPlayer.fullName || player.name,
      duprUrl: player.duprUrl,
      wins: scrapedPlayer.totalWins || player.wins,
      rating: scrapedPlayer.doublesRating || player.duprRating || 0,
    };

    // Only include optional fields if they have values
    if (scrapedPlayer.doublesRating) updateData.duprRating = scrapedPlayer.doublesRating;
    if (scrapedPlayer.imageUrl) updateData.imageUrl = scrapedPlayer.imageUrl;
    if (scrapedPlayer.gender) updateData.gender = scrapedPlayer.gender;
    if (scrapedPlayer.birthYear) updateData.birthYear = scrapedPlayer.birthYear;
    if (scrapedPlayer.ageGroup) updateData.ageGroup = scrapedPlayer.ageGroup;
    if (scrapedPlayer.city) updateData.city = scrapedPlayer.city;
    if (scrapedPlayer.state) updateData.state = scrapedPlayer.state;
    if (scrapedPlayer.country) updateData.country = scrapedPlayer.country;
    if (scrapedPlayer.locationRaw) updateData.locationRaw = scrapedPlayer.locationRaw;
    if (scrapedPlayer.totalLosses !== null && scrapedPlayer.totalLosses !== undefined) updateData.losses = scrapedPlayer.totalLosses;
    if (scrapedPlayer.singlesRating) updateData.singlesRating = scrapedPlayer.singlesRating;
    if (scrapedPlayer.verifiedSince) updateData.verifiedSince = scrapedPlayer.verifiedSince;
    if (scrapedPlayer.yearsActive) updateData.yearsActive = scrapedPlayer.yearsActive;

    await client.mutation(api.players.savePlayer, updateData);

    console.log('✓ Updated in database');
    return { success: true };

  } catch (error) {
    console.log('❌ Error:', error.message);
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log(`=== Batch Backfill (${BATCH_SIZE} players) ===\n`);

  const playersToBackfill = await client.query(api.admin.getPlayersNeedingBackfill);

  console.log(`Total players needing backfill: ${playersToBackfill.length}`);
  console.log(`Processing batch of: ${BATCH_SIZE}\n`);

  if (playersToBackfill.length === 0) {
    console.log('✓ All players are up to date!');
    return;
  }

  const batch = playersToBackfill.slice(0, BATCH_SIZE);

  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  console.log('Players in this batch:');
  batch.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`));
  console.log();

  for (let i = 0; i < batch.length; i++) {
    const player = batch[i];
    console.log(`[${i + 1}/${batch.length}]`);

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
  }

  // Summary
  console.log('\n=== Batch Complete ===');
  console.log(`✓ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Remaining: ${playersToBackfill.length - BATCH_SIZE}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => {
      console.log(`  - ${err.player}: ${err.reason}`);
    });
  }

  if (playersToBackfill.length > BATCH_SIZE) {
    console.log(`\nTo process next batch, run:`);
    console.log(`  NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL} node scripts/backfill-batch.mjs ${BATCH_SIZE}`);
  }
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
