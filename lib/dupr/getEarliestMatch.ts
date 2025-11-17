/**
 * Scrapes DUPR match history to find the earliest verified match date.
 * Uses Browserless Playwright for reliable JS-enabled rendering.
 */

interface BrowserlessResponse {
  success: boolean;
  earliestDate: string | null;
  error?: string;
}

/**
 * Extracts the earliest match date from a DUPR profile URL.
 * Uses Browserless Playwright to:
 * 1. Load the dashboard page with JS enabled
 * 2. Scroll to the bottom until no new matches load
 * 3. Extract all match dates
 * 4. Return the oldest date in ISO format
 *
 * @param duprUrl - Full DUPR dashboard URL (e.g., https://dashboard.dupr.com/dashboard/player/123)
 * @returns ISO date string of earliest match, or null if none found
 */
export async function getEarliestMatch(duprUrl: string): Promise<string | null> {
  try {
    const browserlessToken = process.env.BROWSERLESS_TOKEN;

    if (!browserlessToken) {
      console.error("[getEarliestMatch] BROWSERLESS_TOKEN not configured");
      return null;
    }

    // Normalize URL - ensure we're on the dashboard page
    const normalizedUrl = duprUrl.includes('/dashboard/player/')
      ? duprUrl
      : duprUrl.replace('/player/', '/dashboard/player/');

    const browserlessUrl = `https://chrome.browserless.io/playwright?token=${browserlessToken}`;

    // Playwright script to scroll and extract dates
    const playwrightScript = `
      const { chromium } = require('playwright');

      (async () => {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        try {
          await page.goto('${normalizedUrl}', { waitUntil: 'networkidle', timeout: 30000 });

          // Wait for match history section to load
          await page.waitForSelector('[data-testid="match-history"], .match-history, .matches-list, div[class*="match"]', { timeout: 10000 }).catch(() => {
            console.log('Match history section not found with primary selectors, continuing anyway');
          });

          let previousHeight = 0;
          let currentHeight = await page.evaluate(() => document.body.scrollHeight);
          let scrollAttempts = 0;
          const maxScrollAttempts = 20;

          // Scroll to load all matches
          while (currentHeight > previousHeight && scrollAttempts < maxScrollAttempts) {
            previousHeight = currentHeight;
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1500); // Wait for content to load
            currentHeight = await page.evaluate(() => document.body.scrollHeight);
            scrollAttempts++;
          }

          // Extract all date strings from the page
          const dates = await page.evaluate(() => {
            const datePatterns = [
              // Match ISO dates
              /\\d{4}-\\d{2}-\\d{2}/g,
              // Match common date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
              /\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}/g,
              // Match written dates (Jan 15, 2024, etc.)
              /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \\d{1,2},? \\d{4}/gi,
            ];

            const foundDates = new Set();
            const bodyText = document.body.innerText;

            // Try all patterns
            datePatterns.forEach(pattern => {
              const matches = bodyText.match(pattern);
              if (matches) {
                matches.forEach(match => foundDates.add(match));
              }
            });

            // Also look for date elements with specific attributes
            const dateElements = document.querySelectorAll('[data-date], [datetime], time, .date, .match-date, [class*="date"]');
            dateElements.forEach(el => {
              const dateText = el.textContent?.trim();
              const dateAttr = el.getAttribute('datetime') || el.getAttribute('data-date');
              if (dateText) foundDates.add(dateText);
              if (dateAttr) foundDates.add(dateAttr);
            });

            return Array.from(foundDates);
          });

          await browser.close();

          // Parse and find the earliest date
          const parsedDates = dates
            .map(dateStr => {
              try {
                const parsed = new Date(dateStr);
                return isNaN(parsed.getTime()) ? null : parsed;
              } catch {
                return null;
              }
            })
            .filter(Boolean)
            .filter(date => {
              // Filter out future dates and unreasonably old dates (before 2000)
              const now = new Date();
              const year2000 = new Date('2000-01-01');
              return date <= now && date >= year2000;
            });

          if (parsedDates.length === 0) {
            return JSON.stringify({ success: true, earliestDate: null });
          }

          // Find the oldest date
          const earliestDate = parsedDates.reduce((oldest, current) =>
            current < oldest ? current : oldest
          );

          return JSON.stringify({
            success: true,
            earliestDate: earliestDate.toISOString(),
          });

        } catch (error) {
          await browser.close();
          return JSON.stringify({
            success: false,
            earliestDate: null,
            error: error.message,
          });
        }
      })();
    `;

    // Send request to Browserless
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: playwrightScript,
      }),
    });

    if (!response.ok) {
      console.error(`[getEarliestMatch] Browserless API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const resultText = await response.text();
    const result: BrowserlessResponse = JSON.parse(resultText);

    if (!result.success || !result.earliestDate) {
      console.log(`[getEarliestMatch] No valid dates found for ${duprUrl}`);
      return null;
    }

    console.log(`[getEarliestMatch] Found earliest match: ${result.earliestDate}`);
    return result.earliestDate;

  } catch (error) {
    console.error('[getEarliestMatch] Fatal error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
