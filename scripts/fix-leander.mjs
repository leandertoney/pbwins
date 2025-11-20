/**
 * Fix Leander's rating with the scraped data
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  console.log('=== Fixing Leander Toney Jr Rating ===\n');

  // Update with scraped data
  await client.mutation(api.players.savePlayer, {
    name: "Leander Toney Jr",
    duprUrl: "https://dashboard.dupr.com/dashboard/player/8309056801",
    wins: 120,
    rating: 4.445,
    duprRating: 4.445,
    singlesRating: 4.085,
    losses: 112,
    imageUrl: "https://dupr.s3.us-east-1.amazonaws.com/images/rmILqhs98uqqeEN1gCp9INtn.jpg",
    gender: "M",
    birthYear: 1987,
    city: "Lancaster",
    state: "PA",
    country: "US",
    locationRaw: "Lancaster, PA, US",
    verifiedSince: "2023-01-01T00:00:00.000Z", // Estimated
    yearsActive: 2,
  });

  console.log('✓ Leander Toney Jr updated!');
  console.log('  Doubles Rating: 4.445');
  console.log('  Singles Rating: 4.085');
  console.log('  Wins: 120');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
