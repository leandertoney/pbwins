#!/usr/bin/env ts-node

/**
 * Backfill Script: Verified Since & Years Active
 *
 * Loops through all players and:
 * 1. Checks if they have a duprUrl
 * 2. If they don't have verifiedSince, scrapes it from DUPR
 * 3. Computes yearsActive
 * 4. Regenerates premium bio
 * 5. Updates the DB
 *
 * Usage: npm run backfill:verified
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { getEarliestMatch } from "../lib/dupr/getEarliestMatch";
import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

interface PlayerDoc {
  _id: string;
  name: string;
  slug: string;
  duprUrl: string;
  wins: number;
  rating: number;
  verifiedSince?: string | null;
  yearsActive?: number | null;
  bio?: string | null;
  createdAt?: number;
  city?: string;
}

function generatePremiumBio(
  name: string,
  verifiedSince: string | null,
  yearsActive: number,
  totalWins: number,
  rating: number,
  city?: string
): string {
  const year = verifiedSince ? new Date(verifiedSince).getFullYear() : null;
  const verifiedSinceText = year ? `since ${year}` : "recently";
  const activity = yearsActive >= 3
    ? `over ${yearsActive} years`
    : yearsActive === 0
    ? "recently"
    : `${yearsActive} ${yearsActive === 1 ? 'year' : 'years'}`;

  const consistency = totalWins >= 100
    ? "a dominant force"
    : totalWins >= 50
    ? "a consistent finisher"
    : totalWins >= 20
    ? "an emerging competitor"
    : "a rising talent";

  const location = city || "their region";
  const ratingText = rating ? ` with a ${rating.toFixed(2)} rating` : "";
  const firstName = name.split(' ')[0] || name;

  return `${name} has been competing ${verifiedSinceText}, logging ${totalWins} pbWins.com Verified wins over ${activity}. Known as ${consistency}${ratingText}, ${firstName} has become one of ${location}'s most active competitors.`;
}

async function backfillPlayer(player: PlayerDoc): Promise<{ success: boolean; error?: string }> {
  try {
    const { _id, name, duprUrl, wins, rating, verifiedSince, createdAt, city } = player;

    // Skip if already has verifiedSince
    if (verifiedSince) {
      console.log(`⏭️  Skipping ${name} (already has verifiedSince: ${verifiedSince})`);
      return { success: true };
    }

    // Skip if no duprUrl
    if (!duprUrl) {
      console.log(`⏭️  Skipping ${name} (no DUPR URL)`);
      return { success: true };
    }

    console.log(`🔍 Processing ${name}...`);

    // Scrape earliest match
    const earliestDate = await getEarliestMatch(duprUrl);

    let finalVerifiedSince: string | null = null;
    let yearsActive = 0;

    if (earliestDate) {
      finalVerifiedSince = earliestDate;
      const verifiedYear = new Date(earliestDate).getFullYear();
      const currentYear = new Date().getFullYear();
      yearsActive = Math.max(1, currentYear - verifiedYear);
      console.log(`  ✅ Found earliest match: ${earliestDate} (${yearsActive} years active)`);
    } else {
      // Fall back to createdAt
      if (createdAt) {
        const createdDate = new Date(createdAt);
        finalVerifiedSince = createdDate.toISOString();
        const createdYear = createdDate.getFullYear();
        const currentYear = new Date().getFullYear();
        yearsActive = Math.max(1, currentYear - createdYear);
        console.log(`  ⚠️  No match dates found, using createdAt: ${finalVerifiedSince}`);
      } else {
        console.log(`  ⚠️  No dates available`);
      }
    }

    // Generate bio
    const bio = generatePremiumBio(name, finalVerifiedSince, yearsActive, wins, rating, city);

    // Update player
    await convex.mutation(api.players.updatePlayerMetrics, {
      playerId: _id as Id<"players">,
      verifiedSince: finalVerifiedSince || undefined,
      yearsActive,
      bio,
    });

    console.log(`  💾 Updated ${name}`);
    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Failed to process ${player.name}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  console.log("🚀 Starting backfill of verifiedSince and yearsActive...\n");

  try {
    // Fetch all players
    const players = await convex.query(api.players.getAll, {}) as PlayerDoc[];

    console.log(`📊 Found ${players.length} total players\n`);

    // Filter to players that need processing
    const needsProcessing = players.filter(p => p.duprUrl && !p.verifiedSince);

    console.log(`🎯 ${needsProcessing.length} players need processing\n`);

    if (needsProcessing.length === 0) {
      console.log("✨ All players are already up to date!");
      return;
    }

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    // Process each player
    for (const player of needsProcessing) {
      processed++;
      console.log(`\n[${processed}/${needsProcessing.length}]`);

      const result = await backfillPlayer(player);

      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      if (processed < needsProcessing.length) {
        console.log("  ⏳ Waiting 3s before next player...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 Backfill Summary");
    console.log("=".repeat(50));
    console.log(`Total players: ${players.length}`);
    console.log(`Needed processing: ${needsProcessing.length}`);
    console.log(`✅ Succeeded: ${succeeded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("=".repeat(50));

  } catch (error) {
    console.error("❌ Fatal error during backfill:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✨ Backfill complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  });
