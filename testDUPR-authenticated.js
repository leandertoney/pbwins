import puppeteer from "puppeteer";

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });

    const page = await browser.newPage();

    // Set cookies before navigation
    const cookies = [
      {
        name: "_gpi",
        value: "UID=0000130bb93d5ed9:T=1762982751:RT=1763020463:S=ALNI_MbbVsq5kr4mIUZuGMGjmFiZ-c2dGw",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: true,
      },
      {
        name: "_gads",
        value: "ID=edb03c1832e9c16a:T=1762982751:RT=1763020463:S=ALNI_MZw01owL34GwUK9labTyUK3kH9ykg",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: true,
      },
      {
        name: "_eoi",
        value: "ID=c45803a41b6d4dd7:T=1762982751:RT=1763020463:S=AA-AfjaXEEug-Ri3p0HPgF4oc1va",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: true,
      },
      {
        name: "_s",
        value: "6%2BW9yOAqdl%2FJZzC4ehe%2FscXTG8lr0ryk%2BXDm4%2F50%2FK3px0Ya%2FX6xfMjP8vQQF9Rm",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: true,
      },
      {
        name: "ab.storage.userId.xxx",
        value: "g%3A8309056801%7Ce%3Aundefined%7Cc%3A1763048079928%7Cl%3A1763048079929",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: false,
      },
      {
        name: "ab.storage.sessionId.xxx",
        value: "g%3A76244644-f1fb-b323-d593-a4a47e5f9eb4%7Ce%3A1763049879930%7Cc%3A1763048079928%7Cl%3A1763048079930",
        domain: ".dupr.com",
        path: "/",
        httpOnly: false,
        secure: false,
      },
    ];

    // Visit the dashboard first to set cookies in the right context
    console.log("Navigating to dashboard to set cookies...");
    await page.goto("https://dashboard.dupr.com/dashboard", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Set cookies
    for (const cookie of cookies) {
      await page.setCookie(cookie);
    }

    // Inject localStorage tokens
    console.log("Injecting localStorage tokens...");
    await page.evaluate(() => {
      localStorage.setItem(
        "dupr_access_token",
        "eyJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJodHRwczovL2R1cHIuZ2ciLCJpYXQiOjE3NjMwNDgwNzksImp0aSI6IjgzMDkwNTY4MDEiLCJzdWIiOiJiR1ZoYm1SbGNuUnZibVY1UUdkdFlXbHNMbU52YlE9PSIsInRva2VuX3R5cGUiOiJBQ0NFU1MiLCJleHAiOjE3NjU2NDAwNzl9.A0f4uFBk_FndaD7zZRv4n3AtsudMfCPsIryhmF9lfEwT0HanLQG36cCYvwT07lQui9VBdTH6Nqnz1thNf3HgHiCtrC1W2mUOCwSzAHunJYrJLSbqry80srnFRjgeMk2UBGIV7A4JxBSK7t7TsL9M0JOquglPtnixpsNCPa8tJqS_cJ1CO4kohGh34p86BD7K4O5ST15sCgv9yzwlW2fuSvf8FG2CV0SjkrMoLeIN_imbGHp4FkvvVqVmOOVwVGtz7dSgOKaH8wLy0Y8s7UnJRndjozJJhmzddNSRSwfYwNnlDETF2DM-uxSDrtVhhvyTvsWtsiCObPZjibO3eRG9fw"
      );
      localStorage.setItem(
        "dupr_refresh_token",
        "eyJhbGciOiJSUzUxMiJ9.eyJpc3MiOiJodHRwczovL2R1cHIuZ2ciLCJpYXQiOjE3NjMwNDgwNzksImp0aSI6IjgzMDkwNTY4MDEiLCJzdWIiOiJiR1ZoYm1SbGNuUnZibVY1UUdkdFlXbHNMbU52YlE9PSIsInRva2VuX3R5cGUiOiJSRUZSRVNIIiwiZXhwIjoxNzcwODI0MDc5fQ.Ug1Wr0LRZOMk1czDKkEcujO6Zumw8w-_GNfA9fH1xHgmtxY6A7I3EFHbNVWwK_iBTGULXbhi_2_2RQabbyhIRFIw4wTuybC6rvidlsxz4PBMbEVNb8Ps-G-SiSn_Xf_mlR6iIUUqa396aZgx8dHS_Hviikct3TnxbFVu98lvYUITIXyFuxscuGcMKYwnwHKM8sZs3jpQwiq6UldVJthHJCXhBEMJLdrmCk9A36HWUcDENaUURkcLy6SevgiLOvWhzHaOTDsZgBRb452LI3LDphHOtVyju1Nv-i10sx-iOJ-0r6LpMOuRl6nULFTxiBn2K9l0nZCa1749NaQHs6WSiA"
      );
    });

    // Reload to apply the session
    console.log("Reloading page with session...");
    await page.reload({ waitUntil: "networkidle2", timeout: 30000 });

    // Navigate to player page
    const playerUrl = "https://dashboard.dupr.com/dashboard/player/6908488962";
    console.log("Navigating to player page:", playerUrl);
    await page.goto(playerUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    await page.screenshot({ path: "dupr-loggedin.png", fullPage: true });
    console.log("Screenshot saved as dupr-loggedin.png");

    // Extract LocalStorage data
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    console.log("\n=== LOCAL STORAGE DATA ===");
    console.log(JSON.stringify(localStorageData, null, 2));

    // Extract player data
    const playerData = await page.evaluate(() => {
      // Try multiple selectors for player name
      let name = "Not found";
      const nameSelectors = [
        ".chakra-heading.css-1dklj6k",
        "h1",
        "h2",
        '[data-testid="player-name"]',
        ".player-name",
      ];
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
          name = element.innerText.trim();
          break;
        }
      }

      // Try multiple selectors for rating
      let rating = "Not found";
      const ratingSelectors = [
        ".chakra-stat__number.css-12ccy2u",
        '[data-testid="rating"]',
        ".rating",
        ".player-rating",
      ];
      for (const selector of ratingSelectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText.trim()) {
          rating = element.innerText.trim();
          break;
        }
      }

      // Find wins by looking for stat cards
      let wins = "Not found";
      const statCards = document.querySelectorAll(".chakra-stat");
      for (const card of statCards) {
        const label = card.querySelector(".chakra-stat__label");
        if (label && label.innerText.toLowerCase().includes("wins")) {
          const number = card.querySelector(".chakra-stat__number");
          if (number) {
            wins = number.innerText.trim();
            break;
          }
        }
      }

      // Fallback: search all text for wins
      if (wins === "Not found") {
        const allElements = document.querySelectorAll("*");
        for (const el of allElements) {
          if (el.innerText && el.innerText.toLowerCase().includes("wins")) {
            const parent = el.closest(".chakra-stat, .stat-card, [class*='stat']");
            if (parent) {
              const numberEl = parent.querySelector(
                ".chakra-stat__number, [class*='number'], [class*='value']"
              );
              if (numberEl) {
                wins = numberEl.innerText.trim();
                break;
              }
            }
          }
        }
      }

      return { name, rating, wins };
    });

    console.log("\n=== EXTRACTED PLAYER DATA ===");
    console.log(playerData);
    console.log("=============================\n");

    await browser.close();
  } catch (error) {
    console.error("\n=== ERROR OCCURRED ===");
    console.error(error);
    console.error("======================\n");
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
