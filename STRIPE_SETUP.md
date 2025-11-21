# Stripe Configuration Guide for pbWins

This guide provides complete instructions for setting up Stripe payments for the pbWins sponsor subscription system.

## Overview

pbWins uses Stripe to handle monthly sponsor slot subscriptions at $499/month. The integration includes:

- **Stripe Checkout**: Hosted payment page for subscriptions
- **Webhooks**: Automated event handling for subscription lifecycle
- **Convex Integration**: Database synchronization for sponsor slots

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Stripe Dashboard Setup](#stripe-dashboard-setup)
4. [Webhook Configuration](#webhook-configuration)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Stripe account (create at [stripe.com](https://stripe.com))
- Convex account and deployment
- Node.js 18+ installed
- Access to production deployment environment (e.g., Vercel, Netlify)

---

## Environment Variables

### Required Variables

Create a `.env.local` file in the project root (never commit this file):

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Panel Security
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password_here

# Browserless (for DUPR scraping)
BROWSERLESS_TOKEN=your_browserless_token_here
```

### Where to Find These Values

| Variable | Location | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → Developers → API Keys | Use `pk_test_...` for test mode, `pk_live_...` for production |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → Developers → API Keys | Use `sk_test_...` for test mode, `sk_live_...` for production. **Keep this secret!** |
| `STRIPE_WEBHOOK_SECRET` | [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) → Webhooks → Add endpoint | Generated when you create a webhook endpoint |
| `NEXT_PUBLIC_CONVEX_URL` | [Convex Dashboard](https://dashboard.convex.dev) → Your Project → Settings | Starts with `https://` |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | Local: `http://localhost:3000`, Production: `https://pbwins.com` |

---

## Stripe Dashboard Setup

### 1. Create Product and Price

The current implementation uses these IDs (update if needed):

- **Product ID**: `prod_TQf8eHvE3AMlgP`
- **Price ID**: `price_1STno3LrimuP3B0hfHREG54m`

To create new products:

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Click **"Add product"**
3. Configure:
   - **Name**: "pbWins Sponsor Slot"
   - **Description**: "Monthly sponsor placement on pbWins leaderboard"
   - **Pricing**: Recurring, $499/month
   - **Billing period**: Monthly
4. Click **"Save product"**
5. Copy the Product ID (`prod_...`) and Price ID (`price_...`)
6. Update `PRICE_ID` and `PRODUCT_ID` in `/app/api/checkout/route.ts` if different

### 2. Update Hardcoded IDs (if needed)

If you created new products, update these constants in `/app/api/checkout/route.ts`:

```typescript
const PRICE_ID = "price_YOUR_NEW_PRICE_ID";
const PRODUCT_ID = "prod_YOUR_NEW_PRODUCT_ID";
```

---

## Webhook Configuration

Webhooks are critical for handling subscription events (new subscriptions, cancellations, etc.).

### Local Development Webhook Setup

For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Other platforms: https://stripe.com/docs/stripe-cli#install
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** from the CLI output:
   ```
   > Ready! Your webhook signing secret is whsec_... (^C to quit)
   ```

5. **Add to `.env.local`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Production Webhook Setup

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://pbwins.com/api/stripe/webhook`
   - **Description**: "pbWins sponsor subscription events"
   - **Events to send**: Select these events:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to production environment variables

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` with all required variables (see [Environment Variables](#environment-variables))

### 3. Start Development Server

```bash
npm run dev
```

### 4. Start Stripe Webhook Forwarding

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Test the Flow

1. Navigate to [http://localhost:3000/upgrade](http://localhost:3000/upgrade)
2. Enter a test email address
3. Click "Lock Your Spot — $499"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any billing postal code
5. Complete checkout
6. Verify redirect to success page
7. Check webhook events in Stripe CLI terminal
8. Verify sponsor slot created in Convex database

---

## Production Deployment

### 1. Add Environment Variables to Deployment Platform

**For Vercel:**

1. Go to Project → Settings → Environment Variables
2. Add all required variables (use production/live mode keys)
3. Redeploy

**For Netlify:**

1. Go to Site Settings → Environment Variables
2. Add all required variables
3. Redeploy

### 2. Switch to Live Mode

Update environment variables to use live keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### 3. Configure Production Webhook

Follow [Production Webhook Setup](#production-webhook-setup) above.

### 4. Update Product IDs

Ensure product and price IDs in `/app/api/checkout/route.ts` match your live mode products.

### 5. Test End-to-End

Use real payment methods to verify the entire flow works in production.

---

## Testing

### Test Cards

Use these Stripe test cards in test mode:

| Scenario | Card Number | Notes |
|----------|-------------|-------|
| Success | `4242 4242 4242 4242` | Successful payment |
| Decline | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0025 0000 3155` | Requires authentication |

### Test Webhooks

1. **View all webhook events**:
   ```bash
   stripe events list
   ```

2. **Trigger a test event**:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **View webhook logs** in [Stripe Dashboard → Webhooks → Your Endpoint](https://dashboard.stripe.com/webhooks)

### Test Subscription Cancellation

1. Create a test subscription
2. Go to [Stripe Dashboard → Subscriptions](https://dashboard.stripe.com/test/subscriptions)
3. Find the subscription and click "Cancel subscription"
4. Verify webhook fires and sponsor slot is released in Convex

---

## Troubleshooting

### Webhook Not Receiving Events

**Symptoms**: Sponsor slots not updating after checkout

**Solutions**:

1. **Verify webhook secret**:
   ```bash
   # Check .env.local has correct webhook secret
   cat .env.local | grep STRIPE_WEBHOOK_SECRET
   ```

2. **Check webhook endpoint is reachable**:
   ```bash
   curl https://pbwins.com/api/stripe/webhook
   ```

3. **View webhook delivery attempts** in Stripe Dashboard → Webhooks → Your Endpoint

4. **Check server logs** for errors in webhook handler

### "Stripe is not configured" Error

**Symptoms**: API returns 500 error when creating checkout session

**Solutions**:

1. Verify `STRIPE_SECRET_KEY` is set:
   ```bash
   # Local
   cat .env.local | grep STRIPE_SECRET_KEY

   # Production - check deployment platform environment variables
   ```

2. Ensure `.env.local` is loaded (restart dev server)

3. Check for typos in environment variable names

### "Sold out" Error

**Symptoms**: Cannot create checkout session even though slots should be available

**Solutions**:

1. **Check available slots**:
   - Open Convex Dashboard
   - Query `sponsorSlots` table
   - Count active slots for current month

2. **Verify month calculation**:
   ```javascript
   // Should return next month in "YYYY-MM" format
   const now = new Date();
   const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
   console.log(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
   ```

3. **Manually release test slots** in Convex dashboard if needed

### Checkout Redirect Fails

**Symptoms**: After submitting email, page shows error or doesn't redirect

**Solutions**:

1. **Check browser console** for JavaScript errors

2. **Verify checkout API response**:
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Ensure `session.url` is returned** from Stripe (requires Stripe API version 2022-11-15+)

### Webhook Signature Verification Failed

**Symptoms**: Webhook returns 400 error with "Webhook signature verification failed"

**Solutions**:

1. **Verify webhook secret matches**:
   - Local: Check output from `stripe listen`
   - Production: Check Stripe Dashboard → Webhooks → Signing secret

2. **Ensure raw body is passed** to webhook handler (Next.js should do this automatically)

3. **Check Stripe CLI version** (update if needed):
   ```bash
   stripe version
   stripe upgrade
   ```

---

## File Structure

Key files for Stripe integration:

```
pbwins/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts          # Creates Stripe Checkout sessions
│   │   └── stripe/
│   │       └── webhook/
│   │           └── route.ts      # Handles Stripe webhook events
│   ├── upgrade/
│   │   └── page.tsx              # Sponsor upgrade page
│   ├── success/
│   │   └── page.tsx              # Post-checkout success page
│   └── cancel/
│       └── page.tsx              # Checkout cancellation page
├── convex/
│   ├── schema.ts                 # Database schema with sponsorSlots table
│   └── sponsorSlots.ts           # Mutations/queries for sponsor management
├── .env.example                  # Environment variable template
├── .env.local                    # Local environment variables (gitignored)
└── STRIPE_SETUP.md              # This file
```

---

## Important Security Notes

1. **Never commit secret keys** to version control
2. **Always use test mode** for development
3. **Verify webhook signatures** to prevent fake events
4. **Use environment variables** for all sensitive data
5. **Enable Stripe Radar** for fraud prevention in production
6. **Set up monitoring** for failed webhook deliveries

---

## Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## Support

For issues or questions:

- **Stripe Support**: https://support.stripe.com
- **pbWins Issues**: support@pbwins.com
- **Documentation**: This file and inline code comments

---

**Last Updated**: 2025-11-21
**Stripe API Version**: 2025-10-29.clover
