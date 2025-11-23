import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';

// Use /tmp directory for serverless environments (Netlify, Vercel, etc.)
// This is the only writable location in read-only serverless filesystems
const COOKIES_FILE = path.join('/tmp', 'dupr-cookies.json');

function getBrowserlessEndpoint() {
  const token = process.env.BROWSERLESS_API_KEY;
  // Try different Browserless endpoint formats
  return `wss://production-sfo.browserless.io?token=${token}`;
}

/**
 * Load cookies from environment variable (for serverless) or file (for local dev)
 */
async function loadCookies() {
  // First try environment variable (for production/serverless)
  if (process.env.DUPR_SESSION_COOKIES) {
    try {
      const cookies = JSON.parse(process.env.DUPR_SESSION_COOKIES);
      console.log('✓ Loaded cookies from environment variable');
      return cookies;
    } catch (_error) {
      console.log('⚠ Failed to parse cookies from environment variable');
    }
  }

  // Fall back to file (for local dev)
  try {
    const cookiesString = await fs.readFile(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    console.log('✓ Loaded cookies from file');
    return cookies;
  } catch (_error) {
    console.log('No existing cookies found');
    return null;
  }
}

/**
 * Save cookies to file (local dev only)
 * In production, cookies should be manually added to DUPR_SESSION_COOKIES env var
 */
async function saveCookies(cookies) {
  await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log('✓ Saved cookies to file');
  console.log('📋 To use in production, set this as DUPR_SESSION_COOKIES environment variable:');
  console.log(JSON.stringify(cookies));
}

/**
 * Perform login to DUPR and save cookies
 */
async function performLogin(browser) {
  console.log('Performing login to DUPR...');

  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto('https://dashboard.dupr.com/login', {
      waitUntil: 'networkidle2',
      timeout: 15000, // Reduced from 30s for Netlify timeout limits
    });

    console.log('Waiting for login form...');

    // Wait a bit for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced from 3s

    // Try multiple selector strategies for email input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="mail" i]',
      'input#email',
      '#email',
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        emailInput = selector;
        console.log(`Found email input with selector: ${selector}`);
        break;
      } catch (_e) {
        // Try next selector
      }
    }

    if (!emailInput) {
      // Screenshot removed - doesn't work in serverless read-only filesystem
      console.log('ERROR: Could not find email input field');
      throw new Error('Could not find email input field');
    }

    // Fill in credentials
    await page.type(emailInput, process.env.DUPR_EMAIL);

    // Find password field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input#password',
      '#password',
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        passwordInput = selector;
        console.log(`Found password input with selector: ${selector}`);
        break;
      } catch (_e) {
        // Try next selector
      }
    }

    if (!passwordInput) {
      throw new Error('Could not find password input field');
    }

    await page.type(passwordInput, process.env.DUPR_PASSWORD);

    console.log('Submitting login form...');

    // Click submit button (try multiple possible selectors)
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'input[type="submit"]',
    ];

    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        await page.click(selector);
        submitted = true;
        break;
      } catch (_e) {
        // Try next selector
      }
    }

    if (!submitted) {
      // Fallback: press Enter on password field
      await page.keyboard.press('Enter');
    }

    // Wait for navigation after login
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 10000 // Reduced from 15s
    }).catch(() => {
      console.log('Navigation timeout - checking if login succeeded anyway');
    });

    // Wait a bit for any redirects
    await new Promise(resolve => setTimeout(resolve, 1500)); // Reduced from 3s

    // Check if we're logged in by looking for dashboard elements
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);

    if (currentUrl.includes('/login')) {
      throw new Error('Login failed - still on login page');
    }

    // Get cookies after successful login
    const cookies = await page.cookies();
    await saveCookies(cookies);

    console.log('✓ Login successful');

    await page.close();
    return cookies;

  } catch (error) {
    await page.close();
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Check if session is still valid
 */
async function isSessionValid(browser) {
  const page = await browser.newPage();

  try {
    // Try to access a protected page
    await page.goto('https://dashboard.dupr.com/home', {
      waitUntil: 'networkidle2',
      timeout: 10000, // Reduced from 15s
    });

    const url = page.url();
    await page.close();

    // If we're redirected to login, session is invalid
    if (url.includes('/login')) {
      console.log('Session expired - need to re-login');
      return false;
    }

    console.log('✓ Session is valid');
    return true;

  } catch (error) {
    await page.close();
    console.log('Error checking session:', error.message);
    return false;
  }
}

/**
 * Main function: Get authenticated browser instance
 * Handles cookie loading, login, and session validation
 */
export async function loginAndGetBrowser() {
  console.log('=== DUPR Authentication ===');

  if (!process.env.BROWSERLESS_API_KEY) {
    throw new Error('BROWSERLESS_API_KEY not found in environment variables');
  }

  if (!process.env.DUPR_EMAIL || !process.env.DUPR_PASSWORD) {
    throw new Error('DUPR_EMAIL and DUPR_PASSWORD must be set in environment variables');
  }

  // Launch browser via Browserless
  const browser = await puppeteer.connect({
    browserWSEndpoint: getBrowserlessEndpoint(),
  });

  console.log('✓ Connected to Browserless');

  // Try to load existing cookies
  const cookies = await loadCookies();

  if (cookies) {
    // Set cookies in browser
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.close();

    // Check if session is still valid
    const valid = await isSessionValid(browser);

    if (valid) {
      console.log('✓ Using existing session');
      return browser;
    }

    // Session expired, need to re-login
    console.log('Session expired - logging in again...');
  }

  // Perform login and get new cookies
  const newCookies = await performLogin(browser);

  // Set new cookies in all future pages
  const page = await browser.newPage();
  await page.setCookie(...newCookies);
  await page.close();

  return browser;
}

/**
 * Extract player data from DUPR profile page
 */
export async function extractPlayerData(page) {
  console.log('Waiting for player content to load...');

  // Wait for the page to actually render player-specific content
  // The page is a SPA, so we need to wait for JavaScript to populate it
  try {
    // Wait for player name to appear (it's rendered by JavaScript)
    // Try multiple possible selectors that indicate content is loaded
    await Promise.race([
      page.waitForFunction(
        () => document.title !== 'DUPR - Rating algorithm engineered for pickleball players' && document.title !== 'DUPR',
        { timeout: 10000 }
      ),
      page.waitForFunction(
        () => document.body.innerText.includes('Doubles') && document.body.innerText.match(/\d+\.\d{3}/),
        { timeout: 10000 }
      ),
    ]);
    console.log('✓ Player content loaded');
  } catch (_e) {
    console.log('⚠ Timeout waiting for content, trying extraction anyway...');
  }

  // Give it a bit more time to ensure ratings are rendered
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Extracting player data from page...');

  // Extract player data using page.evaluate to run in browser context
  const playerData = await page.evaluate(() => {
    const data = {
      fullName: null,
      doublesRating: null,
      singlesRating: null,
      totalWins: null,
      recentResults: [],
    };

    // Get all text content for parsing
    const bodyText = document.body.innerText;

    // Extract player name - look for it after "Player Profile" heading
    // Pattern: "Player Profile\n[Name]\n[Gender] • [Location]"
    const profileMatch = bodyText.match(/Player Profile\s+([^\n]+?)\s*\n\s*[MF]\s*•/i);
    if (profileMatch && profileMatch[1]) {
      const name = profileMatch[1].trim();
      // Validate it's a real name (2+ words, not generic text)
      if (name.split(/\s+/).length >= 2 && !name.includes('Cookies') && !name.includes('privacy')) {
        data.fullName = name;
      }
    }

    // Fallback: Parse line by line to find player name
    if (!data.fullName) {
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      for (let i = 0; i < lines.length; i++) {
        // Look for "Player Profile" then get the next meaningful line
        if (lines[i] === 'Player Profile' && i + 1 < lines.length) {
          const candidate = lines[i + 1];
          // Check if next line looks like a name (2+ words, reasonable length)
          if (candidate.split(/\s+/).length >= 2 &&
              candidate.length < 50 &&
              !candidate.includes('•') &&
              !candidate.includes('Cookies')) {
            data.fullName = candidate;
            break;
          }
        }
      }
    }

    // Last resort: Look for name pattern before gender/location pattern
    if (!data.fullName) {
      const nameMatch = bodyText.match(/\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*\n\s*[MF]\s*•/);
      if (nameMatch && nameMatch[1]) {
        data.fullName = nameMatch[1].trim();
      }
    }

    // Extract ratings from body text
    // DUPR shows ratings as X.XXX format (e.g., 4.493)

    // Look for doubles rating - pattern: "Doubles" followed by a decimal number
    const doublesPatterns = [
      /Doubles[^\d]*?([\d]+\.[\d]{3})/i,
      /Doubles\s*Rating[^\d]*?([\d]+\.[\d]{3})/i,
      /Doubles[^\d]*?([\d]+\.[\d]+)/i,
    ];

    for (const pattern of doublesPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        data.doublesRating = parseFloat(match[1]);
        break;
      }
    }

    // Look for singles rating
    const singlesPatterns = [
      /Singles[^\d]*?([\d]+\.[\d]{3})/i,
      /Singles\s*Rating[^\d]*?([\d]+\.[\d]{3})/i,
      /Singles[^\d]*?([\d]+\.[\d]+)/i,
    ];

    for (const pattern of singlesPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        data.singlesRating = parseFloat(match[1]);
        break;
      }
    }

    // Extract wins - look for "Wins: XX" or "XX Wins" pattern
    const winsPatterns = [
      /Wins[:\s]+(\d+)/i,
      /(\d+)\s+Wins/i,
      /Total\s+Wins[:\s]+(\d+)/i,
    ];

    for (const pattern of winsPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        data.totalWins = parseInt(match[1], 10);
        break;
      }
    }

    // If we still don't have ratings, try finding them in the DOM structure
    if (!data.doublesRating) {
      // Look for elements containing rating-like numbers (X.XXX format)
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.textContent;
        // Look for standalone rating numbers (3 decimal places is DUPR's format)
        const ratingMatch = text.match(/^[\s]*(\d+\.\d{3})[\s]*$/);
        if (ratingMatch) {
          const rating = parseFloat(ratingMatch[1]);
          // DUPR ratings are typically between 1.0 and 8.0
          if (rating >= 1.0 && rating <= 8.0) {
            // First rating found is usually doubles
            if (!data.doublesRating) {
              data.doublesRating = rating;
            } else if (!data.singlesRating) {
              data.singlesRating = rating;
            }
          }
        }
      }
    }

    return data;
  });

  console.log('Extracted data:', playerData);

  return playerData;
}

/**
 * Extract ALL win records from a player's match history
 * Returns array of win objects with date, event, location, opponents, etc.
 */
export async function extractMatchHistory(page) {
  console.log('Extracting match history...');

  // Wait for matches to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Scroll in smaller increments to avoid frame detachment
  console.log('Loading all matches...');
  let matchesLoaded = 0;
  let noNewMatchesCount = 0;
  const maxAttempts = 30; // Reasonable limit

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Count current matches
      const currentCount = await page.evaluate(() => {
        return document.querySelectorAll('div.rounded-2xl.bg-white').length;
      });

      // Scroll down incrementally
      await page.evaluate(() => {
        window.scrollBy(0, 800); // Smaller scroll increment
      });

      await new Promise(resolve => setTimeout(resolve, 1000)); // Shorter wait

      const newCount = await page.evaluate(() => {
        return document.querySelectorAll('div.rounded-2xl.bg-white').length;
      });

      if (newCount > currentCount) {
        matchesLoaded = newCount;
        noNewMatchesCount = 0;
        if (i % 5 === 0 && i > 0) {
          console.log(`  Loaded ${matchesLoaded} matches...`);
        }
      } else {
        noNewMatchesCount++;
        // If no new matches after 3 attempts, we're done
        if (noNewMatchesCount >= 3) {
          console.log(`✓ All matches loaded (${matchesLoaded} total)`);
          break;
        }
      }
    } catch (_error) {
      console.log('⚠ Pagination error, extracting what we have...');
      break;
    }
  }

  // Extract all wins
  const wins = await page.evaluate(() => {
    const results = [];
    const matchContainers = document.querySelectorAll('div.rounded-2xl.bg-white');

    for (const container of matchContainers) {
      const text = container.textContent;

      // Only process wins
      if (!text.startsWith('Win')) continue;

      try {
        // Extract rating change
        const ratingMatch = text.match(/^Win([+-]?\d+\.\d+)/);
        const ratingChange = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Extract event name (everything between rating and date)
        const eventMatch = text.match(/Win[+-]?\d+\.\d+(.+?)(\d{2}\/\d{2}\/\d{4})/);
        const eventName = eventMatch ? eventMatch[1].trim() : null;

        // Extract date
        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (!dateMatch) continue;

        const dateStr = dateMatch[1];
        const [month, day, year] = dateStr.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Extract location (after the date, before the next line)
        const locationMatch = text.match(/\d{2}\/\d{2}\/\d{4}\s*•\s*([^\n]+)/);
        const location = locationMatch ? locationMatch[1].trim() : null;

        // Try to extract opponent names (simplified - looks for name patterns)
        // Format typically: "Name1\nRating1\nName2\nRating2\nScore\n..."
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Find lines that look like names (2+ words, no numbers)
        const namePattern = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/;
        const possibleNames = lines.filter(line => namePattern.test(line));

        // Opponents are typically after the player's own name
        const opponents = possibleNames.length >= 2 ? possibleNames.slice(-2).join(' & ') : null;

        results.push({
          result: 'Win',
          date: isoDate,
          dateDisplay: dateStr,
          event: eventName,
          location: location,
          opponents: opponents,
          ratingChange: ratingChange,
        });
      } catch (e) {
        // Skip matches we can't parse
        console.error('Parse error:', e);
      }
    }

    return results;
  });

  console.log(`✓ Extracted ${wins.length} wins`);
  return wins;
}

/**
 * Scroll to bottom of page and extract first match date
 * This is used to find when a player first started playing verified matches
 */
export async function extractFirstMatchDate(page) {
  console.log('Scrolling to find first match date...');

  try {
    // Wait for matches section to be visible
    await new Promise(resolve => setTimeout(resolve, 2000));

    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5; // Reduced to 5 for Netlify timeout limits
    const maxScrollTime = 8000; // Maximum 8 seconds for scrolling (reduced from 15s)
    const startTime = Date.now();

    // Scroll down gradually to load matches - but not all of them
    // We just need enough to find an approximate first match date
    while (scrollAttempts < maxScrollAttempts && (Date.now() - startTime) < maxScrollTime) {
      try {
        // Get current scroll height
        const currentHeight = await page.evaluate(() => {
          // Scroll to bottom
          window.scrollTo(0, document.body.scrollHeight);
          return document.body.scrollHeight;
        });

        // Wait for content to load (shorter wait to avoid timeouts)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if we've reached the bottom (no new content loaded)
        if (currentHeight === previousHeight) {
          console.log('✓ Reached bottom of page');
          break;
        }

        previousHeight = currentHeight;
        scrollAttempts++;

        if (scrollAttempts % 5 === 0) {
          console.log(`Scrolled ${scrollAttempts} times...`);
        }
      } catch (error) {
        // Handle detached frame error
        if (error.message && error.message.includes('detached')) {
          console.log('⚠ Frame detached during scrolling, extracting from current state');
          break;
        }
        // Log other errors but continue
        console.log('⚠ Scroll error, continuing:', error.message);
        break;
      }
    }

    // If we hit max attempts or time limit
    if (scrollAttempts >= maxScrollAttempts || (Date.now() - startTime) >= maxScrollTime) {
      console.log('✓ Loaded sample of matches (time/attempt limit reached)');
    }
  } catch (error) {
    console.log('⚠ Error during initial scroll setup, will try to extract dates anyway:', error.message);
  }

  // Extract all match dates from the page
  let firstMatchDate = null;
  try {
    firstMatchDate = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // Look for match dates in various formats
      // DUPR uses formats like: "10/25/2025", "Oct 25, 2025", etc.
      const datePatterns = [
        // MM/DD/YYYY format (e.g., "10/25/2025")
        /(\d{1,2}\/\d{1,2}\/\d{4})/g,
        // Month DD, YYYY format (e.g., "October 25, 2025")
        /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/gi,
      ];

      const allDates = [];

      // Extract all dates using all patterns
      for (const pattern of datePatterns) {
        const matches = bodyText.matchAll(pattern);
        for (const match of matches) {
          try {
            const dateStr = match[1];
            const parsedDate = new Date(dateStr);
            // Validate it's a reasonable date (after 2000, before 2030)
            if (parsedDate.getFullYear() >= 2000 && parsedDate.getFullYear() <= 2030) {
              allDates.push(parsedDate);
            }
          } catch (_e) {
            // Invalid date, skip
          }
        }
      }

      // Find the earliest date
      if (allDates.length === 0) {
        return null;
      }

      const earliestDate = allDates.reduce((earliest, current) => {
        return current < earliest ? current : earliest;
      });

      // Return ISO string format
      return earliestDate.toISOString();
    });
  } catch (error) {
    if (error.message && error.message.includes('detached')) {
      console.log('⚠ Frame detached during date extraction, returning null');
      firstMatchDate = null;
    } else {
      throw error;
    }
  }

  if (firstMatchDate) {
    console.log('✓ First match date found:', firstMatchDate);
  } else {
    console.log('⚠ No match dates found');
  }

  return firstMatchDate;
}
