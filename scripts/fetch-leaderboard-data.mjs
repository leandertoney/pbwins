/**
 * Fetch current leaderboard data to see what's displaying
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log('=== Fetching Top 10 Leaderboard ===\n');

  // Get all players
  const allPlayers = await client.query(api.admin.getAllPlayersDebug);

  // Sort by wins
  const sortedByWins = allPlayers
    .filter(p => p.wins > 0)
    .sort((a, b) => (b.wins || 0) - (a.wins || 0));

  console.log('Top 10 by wins:\n');

  sortedByWins.slice(0, 10).forEach((player, index) => {
    const rank = index + 1;
    const rating = player.duprRating || player.rating || player.singlesRating || 'NONE';
    const verifiedSince = player.verifiedSince ? new Date(player.verifiedSince).toISOString().split('T')[0] : 'NONE';

    console.log(`${rank}. ${player.name}`);
    console.log(`   Wins: ${player.wins || 0}`);
    console.log(`   Rating: ${rating}`);
    console.log(`   Verified Since: ${verifiedSince}`);
    console.log(`   URL: ${player.duprUrl}`);
    console.log('');
  });

  // Check specifically for Leander
  const leander = allPlayers.find(p => p.name.includes('Leander'));
  if (leander) {
    console.log('=== Leander Toney Jr Details ===');
    console.log(JSON.stringify(leander, null, 2));
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
