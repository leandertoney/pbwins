# Migrating from Netlify to Vercel

## Why Migrate?

**The Problem:**
- Netlify Pro timeout: 26 seconds
- DUPR scraping takes: ~41 seconds (login + scraping)
- Result: 504 Gateway Timeout errors

**The Solution:**
- Vercel Pro timeout: 60 seconds
- Our scraping: 41 seconds < 60 seconds ✅
- Cost: $20/month (same as Netlify Pro)

## Migration Steps (~30 minutes)

### 1. Sign Up for Vercel (5 minutes)

1. Go to https://vercel.com/signup
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 2. Import Your Project (5 minutes)

1. Click **"Add New..."** → **"Project"**
2. Find `pbwins` in your repository list
3. Click **"Import"**
4. **Framework Preset:** Next.js (should auto-detect)
5. **Root Directory:** `.` (leave as default)
6. Click **"Deploy"** (this first deploy will fail - that's OK, we need to add env vars)

### 3. Configure Environment Variables (10 minutes)

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable below (click "+ Add Another" for each):

**Required Variables:**

| Variable Name | Value Source |
|--------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | From Netlify or `.env.local` |
| `BROWSERLESS_API_KEY` | From Netlify |
| `DUPR_EMAIL` | From Netlify |
| `DUPR_PASSWORD` | From Netlify |
| `DUPR_FOUNDER_TOKEN` | From Netlify (optional) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Netlify |
| `STRIPE_SECRET_KEY` | From Netlify |
| `STRIPE_WEBHOOK_SECRET` | See note below ⚠️ |
| `NEXT_PUBLIC_APP_URL` | `https://pbwins.com` |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | From Netlify |

3. **For each variable:**
   - Select scope: **Production, Preview, Development**
   - Click **"Save"**

### 4. Update Stripe Webhook (5 minutes)

⚠️ **Important:** Your Stripe webhook needs a new endpoint URL

1. Go to https://dashboard.stripe.com/webhooks
2. Find your existing webhook (pointing to Netlify)
3. Click **"..."** → **"Update details"**
4. Change endpoint URL to: `https://pbwins.vercel.app/api/stripe/webhook`
5. Save changes
6. **Copy the webhook signing secret** (might be different)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel if it changed

### 5. Configure Function Timeout (2 minutes)

1. Create `vercel.json` in your project root (I'll do this for you)
2. This sets the function timeout to 60 seconds

### 6. Update Domain (5 minutes)

**Option A: Keep pbwins.com domain**

1. In Vercel: Project → **Settings** → **Domains**
2. Add domain: `pbwins.com`
3. Vercel will show DNS records you need to add
4. In your domain registrar (GoDaddy, Namecheap, etc.):
   - Remove/update the records pointing to Netlify
   - Add the records Vercel provides
5. Wait 5-10 minutes for DNS propagation
6. Vercel will automatically provision SSL certificate

**Option B: Use Vercel subdomain temporarily**

1. Your site will be at `pbwins.vercel.app`
2. No DNS changes needed
3. Can move custom domain later

### 7. Deploy and Test (3 minutes)

1. Vercel should auto-deploy when you push to GitHub
2. Or click **"Redeploy"** in Vercel dashboard
3. Wait for deployment to complete (~2 minutes)
4. Test player verification on your live site
5. Should complete in ~41 seconds without timeout ✅

---

## What About Netlify?

**After Vercel is working:**

1. **Keep Netlify running** for a few days to ensure Vercel works
2. **Cancel Netlify subscription** when you're confident
3. **Delete Netlify site** (optional, can keep it as backup)

---

## Configuration File Changes

I'll create the necessary `vercel.json` file with the 60-second timeout configuration.

---

## Rollback Plan

If something goes wrong:

1. **DNS rollback:** Change DNS records back to Netlify (takes 5-10 min)
2. **Keep both running:** You can run both Netlify and Vercel simultaneously
3. **Zero downtime:** DNS change is the only user-facing change

---

## Cost Comparison

| Service | Plan | Cost | Timeout | Our Needs |
|---------|------|------|---------|-----------|
| Netlify | Free | $0 | 10s | ❌ Too short |
| Netlify | Pro | $19/mo | 26s | ❌ Too short |
| Vercel | Hobby | $0 | 10s | ❌ Too short |
| Vercel | Pro | $20/mo | 60s | ✅ Perfect |

**Difference:** $1/month more for 2.3x longer timeout

---

## Expected Results

**Before (Netlify):**
- Verification: 504 timeout after 26s
- Success rate: 0%

**After (Vercel):**
- Verification: ~41s completion
- Success rate: 100%
- Buffer: 19 seconds before timeout

---

## Questions?

- Vercel docs: https://vercel.com/docs
- Vercel support: Very responsive via chat
- This migration is reversible - you can always go back to Netlify
