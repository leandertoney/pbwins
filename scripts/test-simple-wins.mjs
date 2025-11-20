/**
 * Simple test - just get wins from first page load (no scrolling)
 */

import { loginAndGetBrowser } from '../lib/duprClient.js';

const TEST_PLAYER_URL = 'https://dashboard.dupr.com/dashboard/player/8309056801';

async function test() {
  console.log('=== Simple Win Extraction Test ===\n');

  const browser = await loginAndGetBrowser();
  const page = await browser.newPage();

  await page.goto(TEST_PLAYER_URL, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('✓ Page loaded\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const wins = await page.evaluate(() => {
    const results = [];
    const matchContainers = document.querySelectorAll('div.rounded-2xl.bg-white');

    for (const container of matchContainers) {
      const text = container.textContent;
      if (!text.startsWith('Win')) continue;

      // Extract basic info
      const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
      const eventMatch = text.match(/Win[+-]?\d+\.\d+(.+?)\d{2}\/\d{2}\/\d{4}/);

      if (dateMatch) {
        results.push({
          date: dateMatch[1],
          event: eventMatch ? eventMatch[1].trim() : 'Unknown Event',
          preview: text.substring(0, 150),
        });
      }
    }

    return results;
  });

  console.log(`Found ${wins.length} wins on first page:\n`);
  wins.forEach((win, i) => {
    console.log(`${i + 1}. ${win.date} - ${win.event}`);
  });

  console.log('\nFirst win details:');
  console.log(wins[0].preview);

  await page.close();
  await browser.close();
}

test()
  .then(() => {
    console.log('\n✓ Success!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
