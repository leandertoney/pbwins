/**
 * Generate DUPR Session Cookies for Production
 *
 * This script logs into DUPR and generates session cookies that can be
 * stored in the DUPR_SESSION_COOKIES environment variable on Netlify.
 *
 * This avoids having to log in on every request, reducing response time
 * from 30+ seconds to ~5-8 seconds.
 *
 * Usage: node scripts/generate-session-cookies.mjs
 */

import { loginAndGetBrowser } from '../lib/duprClient.js';
import fs from 'fs/promises';
import path from 'path';

console.log('🔐 Generating DUPR session cookies...\n');

try {
  // This will perform login and save cookies to /tmp/dupr-cookies.json
  const browser = await loginAndGetBrowser();
  console.log('\n✅ Login successful!');

  await browser.close();

  // Read the cookies file
  const cookiesPath = path.join('/tmp', 'dupr-cookies.json');
  const cookiesString = await fs.readFile(cookiesPath, 'utf-8');

  console.log('\n📋 Copy this value and add it as DUPR_SESSION_COOKIES in Netlify:');
  console.log('━'.repeat(80));
  console.log(cookiesString);
  console.log('━'.repeat(80));
  console.log('\n📝 Steps to add to Netlify:');
  console.log('1. Go to Netlify Dashboard → Site Settings → Environment Variables');
  console.log('2. Click "Add a variable"');
  console.log('3. Key: DUPR_SESSION_COOKIES');
  console.log('4. Value: Paste the JSON above');
  console.log('5. Click "Save"');
  console.log('6. Redeploy your site\n');
  console.log('⏰ Note: Session cookies expire after ~24-48 hours.');
  console.log('   Re-run this script when verification starts failing again.\n');

} catch (error) {
  console.error('❌ Failed to generate cookies:', error);
  process.exit(1);
}
