import { schedule } from "@netlify/functions";

// Run every hour at the top of the hour (0 * * * *)
// This calls the leaderboard cron endpoint to update all player stats from DUPR
export const handler = schedule("0 * * * *", async () => {
  try {
    const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://pbwins.com';
    const cronUrl = `${baseUrl}/api/cron/leaderboard`;

    console.log('[Netlify Cron] Starting hourly leaderboard update...');
    console.log('[Netlify Cron] Calling:', cronUrl);

    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-Scheduled-Function',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[Netlify Cron] Leaderboard updated successfully');
    console.log('[Netlify Cron] Results:', JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Leaderboard updated successfully',
        data,
      }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Netlify Cron] Failed to update leaderboard:', errorMessage);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to update leaderboard',
        details: errorMessage,
      }),
    };
  }
});
