// Quick script to check what data a player has in the database
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function checkPlayer(slug) {
  const player = await client.query(api.players.getBySlug, { slug });

  if (!player) {
    console.log(`❌ Player not found: ${slug}`);
    return;
  }

  console.log(`\n📊 Player Data for: ${player.name}`);
  console.log(`   ID: ${player._id}`);
  console.log(`   Slug: ${player.slug}`);
  console.log(`   Wins: ${player.wins ?? 'MISSING'}`);
  console.log(`   duprRating: ${player.duprRating ?? 'MISSING ❌'}`);
  console.log(`   rating: ${player.rating ?? 'MISSING ❌'}`);
  console.log(`   singlesRating: ${player.singlesRating ?? 'MISSING ❌'}`);
  console.log(`   DUPR URL: ${player.duprUrl}`);
}

// Check multiple players
await checkPlayer("leander-toney-jr");
await checkPlayer("edward-pearson");

process.exit(0);
