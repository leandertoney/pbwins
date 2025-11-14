import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // show browser for debugging
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const targetUrl = "https://dashboard.dupr.com/dashboard/player/6908488962";

  console.log("Navigating to:", targetUrl);

  await page.goto(targetUrl, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await page.waitForSelector("body");

  // Save screenshot for confirmation
  await page.screenshot({ path: "dupr-test.png", fullPage: true });

  // Extract data from visible DOM
  const playerData = await page.evaluate(() => {
    const name =
      document.querySelector("h1, h2, .player-name, [data-testid='playerName']")?.innerText || "Not found";
    const rating =
      document.querySelector(".rating, .player-rating, [data-testid='rating']")?.innerText || "Not found";
    const wins =
      document.querySelector(".wins, .stat-value, [data-testid='wins']")?.innerText || "Not found";

    return { name, rating, wins };
  });

  console.log("Extracted Player Data:", playerData);
  await browser.close();
})();
