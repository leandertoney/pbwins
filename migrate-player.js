/**
 * Migration script to copy a player from dev to prod deployment
 * Usage: node migrate-player.js "Player Name" [--rescrape]
 *
 * Examples:
 *   node migrate-player.js "Evan Woerner"
 *   node migrate-player.js "Evan Woerner" --rescrape
 */

require('dotenv').config({ path: '.env.local' });
const { ConvexHttpClient } = require("convex/browser");

// Use the actual deployment URLs (not localhost)
const DEV_URL = "https://next-viper-38.convex.cloud";
const PROD_URL = "https://third-sturgeon-287.convex.cloud";

const playerName = process.argv[2];
const shouldRescrape = process.argv.includes('--rescrape');

if (!playerName) {
  console.error('❌ Please provide a player name');
  console.log('Usage: node migrate-player.js "Player Name" [--rescrape]');
  process.exit(1);
}

console.log('\n🔄 Player Migration Tool\n');
console.log('='.repeat(60));
console.log(`Player: ${playerName}`);
console.log(`Re-scrape DUPR: ${shouldRescrape ? 'YES' : 'NO'}`);
console.log(`Dev URL: ${DEV_URL}`);
console.log(`Prod URL: ${PROD_URL}`);
console.log('='.repeat(60) + '\n');

const devClient = new ConvexHttpClient(DEV_URL);
const prodClient = new ConvexHttpClient(PROD_URL);

async function findPlayerInDev(name) {
  try {
    const { api } = await import('./convex/_generated/api.js');
    const players = await devClient.query(api.players.getAll);

    const player = players.find(p =>
      p.name.toLowerCase() === name.toLowerCase()
    );

    return player;
  } catch (error) {
    console.error('❌ Error fetching from dev database:', error.message);
    throw error;
  }
}

async function rescrapePlayer(duprUrl) {
  try {
    console.log('\n🔍 Re-scraping DUPR profile...');

    const match = duprUrl.match(/player\/(\d+)/);
    if (!match) {
      throw new Error('Invalid DUPR URL format');
    }

    const playerId = match[1];
    const { scrapeDupPlayer } = await import('./lib/dupr.ts');

    const result = await scrapeDupPlayer(playerId);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.player;
  } catch (error) {
    console.error('❌ Error scraping DUPR:', error.message);
    throw error;
  }
}

async function saveToProduction(playerData) {
  try {
    const { api } = await import('./convex/_generated/api.js');

    console.log('\n💾 Saving to production database...');

    const result = await prodClient.mutation(api.players.savePlayer, {
      name: playerData.name,
      duprUrl: playerData.duprUrl,
      wins: playerData.wins,
      rating: playerData.rating,
      duprRating: playerData.duprRating,
      imageUrl: playerData.imageUrl,
      gender: playerData.gender,
      birthYear: playerData.birthYear,
      city: playerData.city,
      state: playerData.state,
      country: playerData.country,
      locationRaw: playerData.locationRaw,
      losses: playerData.losses,
      singlesRating: playerData.singlesRating,
      verifiedSince: playerData.verifiedSince,
      yearsActive: playerData.yearsActive,
      bio: playerData.bio,
    });

    return result;
  } catch (error) {
    console.error('❌ Error saving to production:', error.message);
    throw error;
  }
}

function displayPlayerData(player, label = "Player Data") {
  console.log(`\n📋 ${label}:`);
  console.log('─'.repeat(60));
  console.log(`Name:            ${player.fullName || player.name}`);
  console.log(`DUPR URL:        ${player.duprUrl || 'N/A'}`);
  console.log(`Doubles Rating:  ${player.doublesRating || player.rating || 'N/A'}`);
  console.log(`DUPR Rating:     ${player.duprRating || 'N/A'}`);
  console.log(`Singles Rating:  ${player.singlesRating || 'N/A'}`);
  console.log(`Wins:            ${player.totalWins || player.wins || 0}`);
  console.log(`Losses:          ${player.totalLosses || player.losses || 0}`);
  console.log(`Gender:          ${player.gender || 'N/A'}`);
  console.log(`Birth Year:      ${player.birthYear || 'N/A'}`);
  console.log(`Location:        ${player.locationRaw || player.city || 'N/A'}`);
  console.log(`Image URL:       ${player.imageUrl ? '✓ Present' : '✗ Missing'}`);
  console.log('─'.repeat(60));
}

async function migrate() {
  try {
    // Step 1: Find player in dev
    console.log('🔍 Searching for player in dev database...');
    const devPlayer = await findPlayerInDev(playerName);

    if (!devPlayer) {
      console.error(`\n❌ Player "${playerName}" not found in dev database`);
      process.exit(1);
    }

    displayPlayerData(devPlayer, "Current Data in Dev Database");

    // Step 2: Optionally re-scrape
    let finalData = {
      name: devPlayer.name,
      duprUrl: devPlayer.duprUrl,
      wins: devPlayer.wins,
      rating: devPlayer.rating,
      duprRating: devPlayer.duprRating,
      imageUrl: devPlayer.imageUrl,
      gender: devPlayer.gender,
      birthYear: devPlayer.birthYear,
      city: devPlayer.city,
      state: devPlayer.state,
      country: devPlayer.country,
      locationRaw: devPlayer.locationRaw,
      losses: devPlayer.losses,
      singlesRating: devPlayer.singlesRating,
      verifiedSince: devPlayer.verifiedSince,
      yearsActive: devPlayer.yearsActive,
      bio: devPlayer.bio,
    };

    if (shouldRescrape) {
      const scrapedData = await rescrapePlayer(devPlayer.duprUrl);
      displayPlayerData(scrapedData, "Fresh Data from DUPR");

      // Merge scraped data with dev data
      finalData = {
        name: scrapedData.fullName,
        duprUrl: devPlayer.duprUrl,
        wins: scrapedData.totalWins,
        rating: scrapedData.doublesRating,
        duprRating: scrapedData.doublesRating,
        imageUrl: scrapedData.imageUrl || devPlayer.imageUrl,
        gender: scrapedData.gender,
        birthYear: scrapedData.birthYear,
        city: scrapedData.city,
        state: scrapedData.state,
        country: scrapedData.country,
        locationRaw: scrapedData.locationRaw,
        losses: scrapedData.totalLosses,
        singlesRating: scrapedData.singlesRating,
        verifiedSince: devPlayer.verifiedSince,
        yearsActive: devPlayer.yearsActive,
        bio: devPlayer.bio,
      };

      displayPlayerData(finalData, "Final Data to Migrate");
    }

    // Step 3: Save to production
    const result = await saveToProduction(finalData);

    if (result.success) {
      console.log('\n✅ SUCCESS! Player migrated to production');
      console.log(`📊 Action: ${result.updated ? 'Updated existing record' : 'Created new record'}`);
      console.log(`💬 Message: ${result.message}`);
    } else {
      console.error('\n❌ Failed to migrate player');
      console.error('Result:', result);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate()
  .then(() => {
    console.log('\n✨ Migration complete!\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
