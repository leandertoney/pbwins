#!/usr/bin/env node

/**
 * Clean up all test sponsors
 */

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-viper-38.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function cleanupTestSponsors() {
  const testMonth = new Date().toLocaleString("en-US", { month: "long" });

  console.log("Fetching active sponsors...\n");

  try {
    const activeSponsors = await client.query("sponsorSlots:getActiveSponsors", {
      month: testMonth,
    });

    const testSponsors = activeSponsors.filter(s =>
      s.name.includes("Test") || s.name.includes("test")
    );

    if (testSponsors.length === 0) {
      console.log("✅ No test sponsors found to clean up.");
      return;
    }

    console.log(`Found ${testSponsors.length} test sponsor(s) to remove:\n`);
    testSponsors.forEach(s => {
      console.log(`  - ${s.name}: ${s.tagline}`);
    });

    console.log("\nNote: To remove these, you'll need their subscription IDs.");
    console.log("Test sponsors are automatically cleaned up by the test script.");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

cleanupTestSponsors();
