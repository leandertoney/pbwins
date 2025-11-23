# Troubleshooting Guide - DUPR Verification Issues

## Timeline of Issues & Solutions

### Problem: Netlify 504 Gateway Timeout on Player Verification

**Symptoms:**
- Player verification gets to ~100% then fails
- Console shows: `Failed to load resource: 504` from `/api/dupr-browserless`
- "Verification Failed" error shown to user

**Root Cause:**
Netlify serverless functions have strict timeout limits:
- Free tier: 10 seconds
- Pro tier: 26 seconds

DUPR scraping process breakdown:
1. Connect to Browserless: ~2s
2. **Login to DUPR: ~15-20s** ← Main bottleneck
3. Navigate to player page: ~5s
4. Extract data: ~2s
5. Scrape first match date: ~10s (if enabled)

**Total: 34-39 seconds** → Exceeds Netlify's 26s limit

---

## Solutions Attempted

### ❌ Solution 1: Reduce Timeouts (Commit e69197b)
- Reduced login navigation from 30s → 15s
- Reduced wait times from 3s → 1.5s
- **Result:** Still timed out (~30s total)

### ❌ Solution 2: Skip First Match Date (Commit 4de4c31)
- Removed the 10s scrolling operation
- Use current date as fallback
- **Result:** Still timed out (~25s total, borderline)

### ❌ Solution 3: File System Fixes (Commit 650b69b)
- Moved cookies from project root to `/tmp`
- **Problem:** `/tmp` is ephemeral in serverless
- **Result:** Cookies don't persist between requests
- **Consequence:** Every request logs in fresh (adds 15-20s)

### ❌ Solution 4: Use DUPR Public API (Commit 5046713, Reverted)
- Attempted to skip Browserless entirely
- Use only DUPR's REST API
- **Problem:** DUPR API requires authentication/founder token
- **Result:** Reverted - can't use public API

---

## ✅ Final Solution: Environment Variable Cookie Persistence

### Why This Works

**Problem:** Cookie storage in `/tmp` doesn't persist between serverless invocations, forcing fresh login every time.

**Solution:** Store session cookies in `DUPR_SESSION_COOKIES` environment variable.

**Benefits:**
- Login happens once per session (~24-48 hours)
- Subsequent requests skip login entirely
- Verification time: **~5-8 seconds** instead of 30+
- Well within Netlify's 26-second limit

### Implementation Steps

1. **Generate session cookies locally:**
   ```bash
   node scripts/generate-session-cookies.mjs
   ```

2. **Add to Netlify:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add new variable:
     - Key: `DUPR_SESSION_COOKIES`
     - Value: The JSON output from step 1
   - Click Save
   - Redeploy site

3. **Verify it works:**
   - Try verifying a player on live site
   - Should complete in ~5-8 seconds

### Maintenance

**Session Expiration:**
- DUPR sessions expire after ~24-48 hours
- When verification starts failing again, regenerate cookies:
  ```bash
  node scripts/generate-session-cookies.mjs
  ```
- Update `DUPR_SESSION_COOKIES` in Netlify
- Redeploy

---

## Alternative Solutions (If Cookie Approach Fails)

### Option A: Move to Vercel
- Vercel Pro: 60-second timeout limit
- Would accommodate current scraping speed
- **Cost:** Similar to Netlify Pro
- **Effort:** 1-2 hours migration

### Option B: Separate Backend Service
- Deploy scraping API to Railway/Render/VPS
- No timeout limits
- **Cost:** $5-10/month
- **Effort:** 2-3 hours setup

### Option C: Background Queue System
- User gets instant "pending" status
- Worker scrapes data asynchronously
- Updates player when done
- **Pros:** Best UX, no timeout issues
- **Cons:** Most complex (3-4 hours)

---

## Environment Variables Required

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `BROWSERLESS_API_KEY` | Browserless.io API access | https://browserless.io dashboard |
| `DUPR_EMAIL` | DUPR account for scraping | Your DUPR login email |
| `DUPR_PASSWORD` | DUPR account password | Your DUPR password |
| `DUPR_FOUNDER_TOKEN` | DUPR API access (optional) | DUPR founder program |
| `DUPR_SESSION_COOKIES` | Persistent session cookies | Run `generate-session-cookies.mjs` |
| `NEXT_PUBLIC_CONVEX_URL` | Convex database URL | Convex dashboard |

---

## Common Issues

### Issue: "403 Forbidden" from Browserless
**Cause:** Invalid or expired `BROWSERLESS_API_KEY`
**Fix:** Check API key in Browserless.io dashboard

### Issue: "Login failed - still on login page"
**Cause:** Invalid DUPR credentials or page structure changed
**Fix:**
1. Verify `DUPR_EMAIL` and `DUPR_PASSWORD` are correct
2. Check if DUPR login page structure changed

### Issue: Verification works locally but not on Netlify
**Cause:** Missing environment variables in production
**Fix:**
1. Check all env vars are set in Netlify
2. Ensure `DUPR_SESSION_COOKIES` is set
3. Redeploy after adding env vars

### Issue: Verification suddenly starts failing after working
**Cause:** Session cookies expired (happens every 24-48 hours)
**Fix:** Regenerate and update `DUPR_SESSION_COOKIES`

### Issue: Netlify build fails with "Unexpected any" ESLint error
**Cause:** TypeScript ESLint rule `@typescript-eslint/no-explicit-any` blocks production builds when `any` type is used
**Fix:**
1. Replace all `as any` with proper types
2. For Convex IDs, use: `import { Id } from "@/convex/_generated/dataModel"`
3. Type player IDs as: `playerId as Id<"players">`
4. Run `npx tsc --noEmit` locally to verify before pushing
5. **IMPORTANT:** Always check for `any` types before committing - Netlify builds fail on ESLint errors

**Example:**
```typescript
// ❌ Bad - will fail Netlify build
playerId: convexPlayerId as any

// ✅ Good - proper typing
import { Id } from "@/convex/_generated/dataModel";
playerId: convexPlayerId as Id<"players">
```

---

## Debugging Tips

### Enable Detailed Logging
Check Netlify function logs:
1. Netlify Dashboard → Functions
2. Click on `dupr-browserless`
3. View recent invocations

### Test Locally
```bash
# Start dev server
PORT=3002 npm run dev

# Test API in another terminal
curl -X POST http://localhost:3002/api/dupr-browserless \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://dashboard.dupr.com/dashboard/player/[PLAYER_ID]"}'
```

### Check Session Validity
```bash
# This script will test login and show cookie info
node scripts/generate-session-cookies.mjs
```

---

## Key Learnings

1. **Netlify timeout limits are strict** - Can't be extended beyond 26s (Pro tier)
2. **Cookie persistence is critical** - Logging in on every request adds 15-20s
3. **Serverless `/tmp` is ephemeral** - Files don't persist between invocations
4. **Environment variables persist** - Best place for session data in serverless
5. **DUPR requires authentication** - Can't use public API without credentials
6. **First match date scraping is expensive** - Adds 10s+, skip for faster verification
7. **ESLint blocks Netlify builds** - Always use proper types, never `as any` in production code
8. **Two-phase verification wins** - Split slow operations into background tasks for instant UX

---

## Related Files

- `/lib/duprClient.js` - Main scraping logic with login/cookie handling
- `/app/api/dupr-browserless/route.ts` - Fast verification endpoint (Phase 1: ~10s)
- `/app/api/backfill-first-match-date/route.ts` - Background backfill endpoint (Phase 2: ~12s)
- `/components/VerificationLoadingModal.tsx` - User-facing verification UI
- `/scripts/generate-session-cookies.mjs` - Helper to create session cookies
- `/scripts/backfillVerifiedSince.mjs` - Backfill script for existing players
- `/scripts/test-verification-flow.mjs` - Test script for two-phase verification flow
