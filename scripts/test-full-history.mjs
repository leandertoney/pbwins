/**
 * Test the new extractMatchHistory function
 */

import { loginAndGetBrowser, extractMatchHistory } from '../lib/duprClient.js';

const TEST_PLAYER_URL = 'https://dashboard.dupr.com/dashboard/player/8309056801';

async function test() {
  console.log('=== Testing Full Match History Extraction ===\n');

  const browser = await loginAndGetBrowser();
  const page = await browser.newPage();

  await page.goto(TEST_PLAYER_URL, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('✓ Page loaded\n');

  // Extract all wins using the new function
  const wins = await extractMatchHistory(page);

  console.log('\n=== Results ===\n');
  console.log(`Total wins extracted: ${wins.length}\n`);

  if (wins.length > 0) {
    console.log('Most recent 5 wins:\n');
    wins.slice(0, 5).forEach((win, i) => {
      console.log(`${i + 1}. ${win.dateDisplay} - ${win.event || 'Event'}`);
      console.log(`   Location: ${win.location || 'N/A'}`);
      console.log(`   Opponents: ${win.opponents || 'N/A'}`);
      console.log(`   Rating: ${win.ratingChange > 0 ? '+' : ''}${win.ratingChange || 'N/A'}`);
      console.log('');
    });

    console.log('\nOldest 5 wins:\n');
    wins.slice(-5).forEach((win, i) => {
      console.log(`${i + 1}. ${win.dateDisplay} - ${win.event || 'Event'}`);
    });

    // Calculate date range
    const dates = wins.map(w => new Date(w.date)).sort((a, b) => a - b);
    const earliest = dates[0];
    const latest = dates[dates.length - 1];
    console.log('\n---');
    console.log(`Date range: ${earliest.toLocaleDateString()} to ${latest.toLocaleDateString()}`);
  }

  await page.close();
  await browser.close();
}

test()
  .then(() => {
    console.log('\n✓ Test complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
