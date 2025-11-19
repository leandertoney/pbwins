/**
 * Test script to verify Convex database access
 * Run with: node test-database-access.js
 */

require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

console.log('\n🔍 Testing Convex Database Access\n');
console.log('='.repeat(50));
console.log(`CONVEX_URL: ${CONVEX_URL || '❌ NOT SET'}`);
console.log('='.repeat(50) + '\n');

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL is not set in .env.local');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testDatabaseAccess() {
  try {
    console.log('📊 Fetching player count...');

    // Load API dynamically
    const { api } = await import('./convex/_generated/api.js');

    // Query all players
    const players = await client.query(api.players.getAll);

    console.log(`✅ Successfully connected to Convex!`);
    console.log(`📈 Total players in database: ${players.length}`);

    if (players.length > 0) {
      console.log(`\n📋 Sample players (first 5):`);
      players.slice(0, 5).forEach((player, idx) => {
        console.log(`  ${idx + 1}. ${player.name} - ${player.wins} wins (${player.rating} rating)`);
      });
    }

    console.log('\n✅ Database access test PASSED!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Database access test FAILED!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    return false;
  }
}

testDatabaseAccess()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
