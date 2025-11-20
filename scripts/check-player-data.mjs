/**
 * Quick script to check what data players have
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log('=== Checking Player Data ===\n');

  const playersNeedingBackfill = await client.query(api.admin.getPlayersNeedingBackfill);

  console.log(`Players still needing backfill: ${playersNeedingBackfill.length}\n`);

  if (playersNeedingBackfill.length === 0) {
    console.log('✓ All players have complete data!');
    return;
  }

  console.log('Missing data:');
  playersNeedingBackfill.forEach(p => {
    const missing = [];
    if (!p.duprRating) missing.push('rating');
    if (!p.verifiedSince) missing.push('verifiedSince');
    console.log(`  ${p.name}: ${missing.join(', ')} | Wins: ${p.wins || 0}`);
  });

  console.log('\n=== Checking all players for display issues ===\n');

  const allPlayers = await client.query(api.admin.getAllPlayersDebug);
  console.log(`Total players: ${allPlayers.length}\n`);

  const playersWithIssues = allPlayers.filter(p => {
    return !p.duprRating && !p.rating && !p.singlesRating;
  });

  if (playersWithIssues.length > 0) {
    console.log(`Players with NO ratings at all: ${playersWithIssues.length}`);
    playersWithIssues.forEach(p => {
      console.log(`  - ${p.name}: ${p.wins || 0} wins`);
    });
  } else {
    console.log('✓ All players have at least one rating field!');
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
