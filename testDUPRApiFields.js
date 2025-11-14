// Test script to discover all available DUPR API fields
import fs from 'fs/promises';
import path from 'path';

const COOKIES_FILE = path.join(process.cwd(), 'dupr-cookies.json');

async function testDUPRApi() {
  console.log('=== DUPR API Field Discovery ===\n');

  // Load access token from cookies
  let accessToken = process.env.DUPR_FOUNDER_TOKEN;
  try {
    const cookiesString = await fs.readFile(COOKIES_FILE, 'utf-8');
    const cookies = JSON.parse(cookiesString);
    const accessTokenCookie = cookies.find(c => c.name === 'dupr_access_token');
    if (accessTokenCookie) {
      accessToken = accessTokenCookie.value;
      console.log('✓ Using access token from saved cookies\n');
    }
  } catch (error) {
    console.log('Using DUPR_FOUNDER_TOKEN\n');
  }

  const playerId = "8309056801"; // Leander Toney Jr

  console.log('Testing player ID:', playerId);
  console.log('=' .repeat(60));

  // Test 1: Stats API
  console.log('\n1. STATS API RESPONSE:');
  console.log('Endpoint: https://api.dupr.gg/user/calculated/v1.0/stats/' + playerId);
  const statsResponse = await fetch(`https://api.dupr.gg/user/calculated/v1.0/stats/${playerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const statsData = await statsResponse.json();
  console.log(JSON.stringify(statsData, null, 2));

  // Test 2: Profile API
  console.log('\n' + '='.repeat(60));
  console.log('\n2. PROFILE API RESPONSE:');
  console.log('Endpoint: https://api.dupr.gg/player/v1.0/' + playerId);
  const profileResponse = await fetch(`https://api.dupr.gg/player/v1.0/${playerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const profileData = await profileResponse.json();
  console.log(JSON.stringify(profileData, null, 2));

  // Test 3: HTML Scraping
  console.log('\n' + '='.repeat(60));
  console.log('\n3. HTML SCRAPING:');
  console.log('URL: https://dashboard.dupr.com/dashboard/player/' + playerId);

  const htmlResponse = await fetch(`https://dashboard.dupr.com/dashboard/player/${playerId}`);
  const html = await htmlResponse.text();

  // Extract key patterns
  console.log('\nSearching for demographic patterns in HTML...\n');

  // Gender
  const genderMatch = html.match(/M\s*•\s*\d+\s*•/) ||
                     html.match(/F\s*•\s*\d+\s*•/) ||
                     html.match(/"gender"\s*:\s*"([MF])"/) ||
                     html.match(/Gender[:\s]*([MF])/i);
  console.log('Gender pattern:', genderMatch ? genderMatch[0] : 'Not found');

  // Age
  const ageMatch = html.match(/•\s*(\d{2})\s*•/) ||
                  html.match(/"age"\s*:\s*(\d{2})/) ||
                  html.match(/Age[:\s]*(\d{2})/i);
  console.log('Age pattern:', ageMatch ? ageMatch[0] : 'Not found');

  // Location
  const locationMatch = html.match(/([A-Za-z\s]+),\s*([A-Z]{2}),\s*([A-Z]{2,3})/) ||
                       html.match(/"location"\s*:\s*"([^"]+)"/) ||
                       html.match(/Location[:\s]*([^<]+)/i);
  console.log('Location pattern:', locationMatch ? locationMatch[0] : 'Not found');

  // Losses
  const lossesMatch = html.match(/Losses[^\d]*(\d+)/i);
  console.log('Losses pattern:', lossesMatch ? lossesMatch[0] : 'Not found');

  console.log('\n' + '='.repeat(60));
  console.log('\n=== SUMMARY ===');
  console.log('\nFields to extract:');
  console.log('- Gender:', genderMatch ? `Found (${genderMatch[1] || 'need to refine regex'})` : 'Not found - needs HTML scraping');
  console.log('- Age:', ageMatch ? `Found (${ageMatch[1] || 'need to refine regex'})` : 'Not found - needs HTML scraping');
  console.log('- Location:', locationMatch ? 'Found (needs parsing)' : 'Not found - needs HTML scraping');
  console.log('- Losses:', lossesMatch ? `Found (${lossesMatch[1]})` : 'Available in stats API');
  console.log('- Singles Rating:', 'Available in stats API ✓');
}

testDUPRApi().catch(console.error);
