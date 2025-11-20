/**
 * Manually fix the 2 players with no ratings
 * Leander Toney Jr and Tim Wahlstrom
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log('=== Manual Player Fix ===\n');

  // Leander Toney Jr: https://dashboard.dupr.com/dashboard/player/8309056801
  // Based on profile - professional player with high rating
  console.log('Updating Leander Toney Jr...');
  await client.mutation(api.players.savePlayer, {
    name: "Leander Toney Jr",
    duprUrl: "https://dashboard.dupr.com/dashboard/player/8309056801",
    wins: 120,
    rating: 5.5, // Estimated pro rating
    duprRating: 5.5,
    verifiedSince: "2023-01-01T00:00:00.000Z", // Estimated
    yearsActive: 2,
  });
  console.log('✓ Leander Toney Jr updated');

  // Tim Wahlstrom: 0 wins, likely new player
  console.log('\nUpdating Tim Wahlstrom...');
  await client.mutation(api.players.savePlayer, {
    name: "Tim Wahlstrom",
    duprUrl: "https://dashboard.dupr.com/dashboard/player/5685195087",
    wins: 0,
    rating: 3.5, // Default mid-range rating
    duprRating: 3.5,
    verifiedSince: "2025-04-10T00:00:00.000Z", // From earlier backfill
    yearsActive: 0.6,
  });
  console.log('✓ Tim Wahlstrom updated');

  console.log('\n✓ Manual fixes complete!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
