import puppeteer from "puppeteer";

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set up request interception to capture API calls
    await page.setRequestInterception(true);

    const apiResponses = [];

    page.on('request', request => {
      request.continue();
    });

    page.on('response', async response => {
      const url = response.url();

      // Capture DUPR API responses
      if (url.includes('api.dupr.gg') || url.includes('dashboard.dupr.com/api')) {
        try {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            apiResponses.push({
              url,
              status: response.status(),
              data
            });
            console.log(`\n=== API RESPONSE: ${url} ===`);
            console.log(JSON.stringify(data, null, 2));
          }
        } catch (e) {
          // Ignore errors from non-JSON responses
        }
      }
    });

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
    ];

    // Visit the dashboard first to set cookies
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

    // Navigate to player page
    const playerUrl = "https://dashboard.dupr.com/dashboard/player/6908488962";
    console.log("\nNavigating to player page:", playerUrl);
    await page.goto(playerUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for API calls to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log("\n\n=== ALL API RESPONSES CAPTURED ===");
    console.log(`Total API calls captured: ${apiResponses.length}`);

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
