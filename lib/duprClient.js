import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';

const COOKIES_FILE = path.join(process.cwd(), 'dupr-cookies.json');

function getBrowserlessEndpoint() {
  const token = process.env.BROWSERLESS_API_KEY;
  // Try different Browserless endpoint formats
  return `wss://production-sfo.browserless.io?token=${token}`;
}

/**
 * Load cookies from file
 */
async function loadCookies() {
  try {
    const cookiesString = await fs.readFile(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    console.log('✓ Loaded cookies from file');
    return cookies;
  } catch (error) {
    console.log('No existing cookies found');
    return null;
  }
}

/**
 * Save cookies to file
 */
async function saveCookies(cookies) {
  await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log('✓ Saved cookies to file');
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
      timeout: 30000,
    });

    console.log('Waiting for login form...');

    // Wait a bit for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

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
      } catch (e) {
        // Try next selector
      }
    }

    if (!emailInput) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'dupr-login-debug.png' });
      console.log('Screenshot saved as dupr-login-debug.png');
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
      } catch (e) {
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
      } catch (e) {
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
      timeout: 15000
    }).catch(() => {
      console.log('Navigation timeout - checking if login succeeded anyway');
    });

    // Wait a bit for any redirects
    await new Promise(resolve => setTimeout(resolve, 3000));

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
      timeout: 15000,
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
  console.log('Waiting for page content to load...');

  // Wait longer for JavaScript to fully render
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Try to wait for specific content indicators
  try {
    // Wait for any of these to appear (indicators that content is loaded)
    await Promise.race([
      page.waitForSelector('h1', { timeout: 5000 }),
      page.waitForSelector('[class*="rating" i]', { timeout: 5000 }),
      page.waitForSelector('[class*="player" i]', { timeout: 5000 }),
    ]).catch(() => console.log('Timeout waiting for selectors, continuing anyway...'));
  } catch (e) {
    console.log('Could not find expected selectors, trying alternative approach...');
  }

  console.log('Extracting player data from page...');

  // Extract player data
  const playerData = await page.evaluate(() => {
    const data = {
      fullName: null,
      doublesRating: null,
      singlesRating: null,
      totalWins: null,
      recentResults: [],
    };

    // Extract player name - try multiple strategies
    // Strategy 1: Page title
    const titleMatch = document.title.match(/^(.+?)\s*[-–—|]/);
    if (titleMatch && titleMatch[1] !== 'DUPR') {
      data.fullName = titleMatch[1].trim();
    }

    // Strategy 2: Meta tags
    if (!data.fullName) {
      const metaTag = document.querySelector('meta[property="og:title"]');
      if (metaTag && metaTag.content) {
        data.fullName = metaTag.content.trim();
      }
    }

    // Strategy 3: First h1 or h2
    if (!data.fullName) {
      const heading = document.querySelector('h1, h2');
      if (heading && heading.textContent.trim().length > 0) {
        data.fullName = heading.textContent.trim();
      }
    }

    // Strategy 4: Look for player name in class names
    if (!data.fullName) {
      const playerNameEl = document.querySelector('[class*="player-name" i], [class*="playerName" i], [data-testid*="player" i]');
      if (playerNameEl) {
        data.fullName = playerNameEl.textContent.trim();
      }
    }

    // Extract ratings - look through all text content
    const allText = document.body.innerText;

    // Look for "Doubles Rating" followed by a number
    const doublesMatch = allText.match(/Doubles\s+Rating[^\d]*(\d+\.?\d*)/i);
    if (doublesMatch) {
      data.doublesRating = parseFloat(doublesMatch[1]);
    }

    // Look for "Singles Rating" followed by a number
    const singlesMatch = allText.match(/Singles\s+Rating[^\d]*(\d+\.?\d*)/i);
    if (singlesMatch) {
      data.singlesRating = parseFloat(singlesMatch[1]);
    }

    // Look for "Wins" followed by a number (may have colon or other chars in between)
    const winsMatch = allText.match(/Wins[^\d]*(\d+)/i);
    if (winsMatch) {
      data.totalWins = parseInt(winsMatch[1], 10);
    }

    // Alternative: Look for rating values in elements
    if (!data.doublesRating) {
      const ratingElements = Array.from(document.querySelectorAll('[class*="rating" i]'));
      for (const el of ratingElements) {
        const text = el.textContent;
        if (text.includes('Doubles') || text.includes('doubles')) {
          const match = text.match(/(\d+\.?\d*)/);
          if (match) {
            data.doublesRating = parseFloat(match[1]);
            break;
          }
        }
      }
    }

    return data;
  });

  console.log('Initial extraction:', playerData);

  // Fallback: Parse HTML directly
  const html = await page.content();

  if (!playerData.fullName) {
    // Try og:title meta tag
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (ogTitleMatch) {
      playerData.fullName = ogTitleMatch[1].trim();
    }
  }

  if (!playerData.fullName) {
    // Try page title
    const titleMatch = html.match(/<title>([^<]+?)\s*[-–—|]/);
    if (titleMatch && titleMatch[1] !== 'DUPR') {
      playerData.fullName = titleMatch[1].trim();
    }
  }

  if (!playerData.doublesRating) {
    // Look in HTML for rating
    const ratingMatch = html.match(/Doubles\s+Rating[^\d]*(\d+\.?\d*)/i);
    if (ratingMatch) {
      playerData.doublesRating = parseFloat(ratingMatch[1]);
    }
  }

  if (!playerData.totalWins) {
    // Look in HTML for wins
    const winsMatch = html.match(/Wins[^\d]*(\d+)/i);
    if (winsMatch) {
      playerData.totalWins = parseInt(winsMatch[1], 10);
    }
  }

  console.log('Final extracted data:', playerData);

  return playerData;
}
