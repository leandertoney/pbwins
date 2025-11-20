/**
 * Test script to see if we can scrape actual match history from DUPR
 * Test with Leander's profile
 */

import { loginAndGetBrowser } from '../lib/duprClient.js';

const TEST_PLAYER_URL = 'https://dashboard.dupr.com/dashboard/player/8309056801'; // Leander

async function scrapeMatchHistory(playerUrl) {
  console.log('=== Testing Match History Scraping ===\n');
  console.log('Player URL:', playerUrl);

  let browser;
  try {
    // Get authenticated browser
    browser = await loginAndGetBrowser();

    console.log('✓ Authenticated and connected');

    const page = await browser.newPage();

    // Navigate to player profile
    await page.goto(playerUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('✓ Page loaded\n');

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Scroll to load all matches (DUPR lazy-loads matches)
    console.log('Scrolling to load all matches...');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;

    while (scrollAttempts < maxScrollAttempts) {
      try {
        const currentHeight = await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
          return document.body.scrollHeight;
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (currentHeight === previousHeight) {
          console.log('✓ Reached bottom after', scrollAttempts, 'scrolls');
          break;
        }

        previousHeight = currentHeight;
        scrollAttempts++;

        if (scrollAttempts % 10 === 0) {
          console.log(`  Scrolled ${scrollAttempts} times...`);
        }
      } catch (error) {
        console.log('⚠ Scroll error (probably reached end):', error.message);
        break;
      }
    }

    console.log('\nExtracting all wins...\n');

    // Extract ALL wins from the page
    let matches = [];
    try {
      // Create a new page if the current one is detached
      const extractPage = await browser.newPage();
      await extractPage.goto(playerUrl, {
        waitUntil: 'load',
        timeout: 15000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      matches = await extractPage.evaluate(() => {
        const wins = [];

        // Find all match containers (identified from previous test)
        const matchContainers = document.querySelectorAll('div.rounded-2xl.bg-white');

        for (const container of matchContainers) {
          const text = container.textContent;

          // Only process wins (starts with "Win")
          if (!text.startsWith('Win')) continue;

          try {
            // Extract result and rating change
            const resultMatch = text.match(/^Win([+-]?\d+\.\d+)/);
            const ratingChange = resultMatch ? resultMatch[1] : null;

            // Extract event name (before the date)
            const eventMatch = text.match(/Win[+-]?\d+\.\d+(.+?)\d{2}\/\d{2}\/\d{4}/);
            const eventName = eventMatch ? eventMatch[1].trim() : null;

            // Extract date and location
            const dateLocationMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s*•\s*([^]+?)(?=\n|$)/);
            const matchDate = dateLocationMatch ? dateLocationMatch[1] : null;
            const location = dateLocationMatch ? dateLocationMatch[2].split('\n')[0].trim() : null;

            // Extract players and scores (this is simplified - the actual DOM structure would be better)
            // For now, just store the full text and we can parse it better later

            if (matchDate) {
              wins.push({
                result: 'Win',
                ratingChange: ratingChange,
                eventName: eventName,
                date: matchDate,
                location: location,
                rawText: text.substring(0, 300), // Store raw text for debugging
              });
            }
          } catch (e) {
            // Skip matches we can't parse
          }
        }

        return wins;
      });

      await extractPage.close();
    } catch (error) {
      console.log('⚠ Extraction error:', error.message);
    }

    console.log('=== Extraction Results ===\n');
    console.log(`Total wins found: ${matches.length}\n`);

    if (matches.length === 0) {
      console.log('❌ No wins found!');
    } else {
      console.log('First 10 wins:\n');
      matches.slice(0, 10).forEach((match, i) => {
        console.log(`${i + 1}. ${match.date} - ${match.eventName || 'Event'}`);
        console.log(`   Location: ${match.location || 'N/A'}`);
        console.log(`   Rating: ${match.ratingChange || 'N/A'}`);
        console.log('');
      });

      console.log('\nLast 5 wins (earliest):');
      matches.slice(-5).forEach((match, i) => {
        console.log(`${i + 1}. ${match.date} - ${match.eventName || 'Event'}`);
      });

      console.log('\n---\n');
      console.log('Sample raw data from first win:');
      console.log(matches[0].rawText);
    }

    await page.close();
    await browser.close();

    return matches;

  } catch (error) {
    console.error('Error:', error.message);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

scrapeMatchHistory(TEST_PLAYER_URL)
  .then(() => {
    console.log('\n✓ Test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
