# Stripe Configuration Checklist

Use this checklist to ensure Stripe is configured correctly for pbWins.

## 🔧 Environment Setup

### Local Development
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode: `pk_test_...`)
- [ ] Add `STRIPE_SECRET_KEY` (test mode: `sk_test_...`)
- [ ] Add `STRIPE_WEBHOOK_SECRET` (from Stripe CLI: `whsec_...`)
- [ ] Add `NEXT_PUBLIC_CONVEX_URL` from Convex dashboard
- [ ] Add `NEXT_PUBLIC_APP_URL` as `http://localhost:3000`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
- [ ] Login to Stripe CLI: `stripe login`

### Production Deployment
- [ ] Add all environment variables to deployment platform (Vercel/Netlify)
- [ ] Switch to live mode keys (`pk_live_...` and `sk_live_...`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL (e.g., `https://pbwins.com`)
- [ ] Configure production webhook endpoint in Stripe Dashboard
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

---

## 🎯 Stripe Dashboard Configuration

### Products & Pricing
- [ ] Verify product exists: `prod_TQf8eHvE3AMlgP` (or create new product)
- [ ] Verify price exists: `price_1STno3LrimuP3B0hfHREG54m` ($499/month)
- [ ] Update product IDs in `/app/api/checkout/route.ts` if different
- [ ] Set product name: "pbWins Sponsor Slot"
- [ ] Set pricing model: Recurring, Monthly, $499
- [ ] Add product description

### Webhook Configuration

#### Local Development
- [ ] Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Copy webhook signing secret to `.env.local`
- [ ] Keep Stripe CLI running during development

#### Production
- [ ] Create webhook endpoint in [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
- [ ] Set endpoint URL: `https://pbwins.com/api/stripe/webhook`
- [ ] Subscribe to event: `checkout.session.completed`
- [ ] Subscribe to event: `customer.subscription.deleted`
- [ ] Copy signing secret to production environment variables
- [ ] Test webhook delivery (send test event)

### API Keys
- [ ] Copy publishable key from [API Keys page](https://dashboard.stripe.com/test/apikeys)
- [ ] Copy secret key (keep this secure!)
- [ ] Switch to live mode keys for production

---

## 💻 Code Configuration

### File: `/app/api/checkout/route.ts`
- [x] Stripe SDK initialized with correct API version
- [x] `STRIPE_SECRET_KEY` environment variable loaded
- [x] `PRICE_ID` constant set correctly
- [x] `PRODUCT_ID` constant set correctly
- [x] Checkout session includes subscription metadata
- [x] Success/cancel URLs configured
- [x] Returns both `id` and `url` in response
- [x] Integrates with Convex to reserve slots

### File: `/app/api/stripe/webhook/route.ts`
- [ ] Verify webhook handler exists
- [ ] Verify signature verification using `STRIPE_WEBHOOK_SECRET`
- [ ] Handles `checkout.session.completed` event
- [ ] Handles `customer.subscription.deleted` event
- [ ] Integrates with Convex to update sponsor slots
- [ ] Returns proper HTTP status codes (200 for success, 400 for errors)

### File: `/app/upgrade/page.tsx`
- [x] Email input form created
- [x] Submits POST request to `/api/checkout`
- [x] Handles loading state
- [x] Handles error messages
- [x] Redirects to Stripe Checkout URL
- [x] Displays pricing and benefits clearly

### File: `/app/success/page.tsx`
- [x] Retrieves session from Stripe using session_id
- [x] Displays confirmation message
- [x] Shows customer email
- [x] Shows subscription month
- [x] Provides link back to homepage

### File: `/app/cancel/page.tsx`
- [ ] Verify cancellation page exists
- [ ] Displays appropriate message
- [ ] Provides link back to homepage or upgrade page

### File: `/convex/schema.ts`
- [x] `sponsorSlots` table defined
- [x] Contains `stripeCustomerId` field
- [x] Contains `stripeSubscriptionId` field
- [x] Contains `checkoutSessionId` field
- [x] Proper indexes created

### File: `/convex/sponsorSlots.ts`
- [ ] Verify `reserveSlot` mutation exists
- [ ] Verify `finalizeSlot` mutation exists (called by webhook)
- [ ] Verify `unlockSlot` mutation exists (called by webhook)
- [ ] Verify `spotsLeft` query exists

---

## 🧪 Testing

### Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Start Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Navigate to `http://localhost:3000/upgrade`
- [ ] Submit form with test email
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect to success page
- [ ] Check webhook received in Stripe CLI terminal
- [ ] Verify sponsor slot created in Convex dashboard

### Test Different Scenarios
- [ ] Test successful payment
- [ ] Test declined card: `4000 0000 0000 0002`
- [ ] Test 3D Secure: `4000 0025 0000 3155`
- [ ] Test subscription cancellation
- [ ] Test "sold out" scenario (when 20 slots filled)
- [ ] Test duplicate email for same month

### Production Testing
- [ ] Use real payment method (small test charge)
- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Check production database updates
- [ ] Test subscription cancellation flow
- [ ] Verify email receipts sent by Stripe

---

## 📊 Monitoring & Maintenance

### Regular Checks
- [ ] Monitor webhook delivery success rate in Stripe Dashboard
- [ ] Check for failed payments
- [ ] Review subscription cancellations
- [ ] Monitor sponsor slot availability
- [ ] Check for duplicate or stuck slots

### Stripe Dashboard Monitoring
- [ ] Set up email notifications for failed webhooks
- [ ] Enable Stripe Radar for fraud prevention (production)
- [ ] Review transaction logs weekly
- [ ] Monitor subscription churn rate

---

## 🔒 Security

- [x] `.env` added to `.gitignore`
- [x] `.env.local` added to `.gitignore`
- [ ] Never commit secret keys to git
- [ ] Use test mode keys for development
- [ ] Webhook signature verification enabled
- [ ] HTTPS required for production webhook endpoints
- [ ] Environment variables secured in deployment platform

---

## 📍 All Stripe Touchpoints

### Files that DIRECTLY use Stripe:

1. **`/app/api/checkout/route.ts`**
   - Creates Stripe Checkout sessions
   - Requires: `STRIPE_SECRET_KEY`

2. **`/app/api/stripe/webhook/route.ts`**
   - Handles Stripe webhook events
   - Requires: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

3. **`/app/upgrade/page.tsx`**
   - User-facing checkout form
   - Redirects to Stripe Checkout

4. **`/app/success/page.tsx`**
   - Retrieves Stripe session details
   - Requires: `STRIPE_SECRET_KEY`

5. **`/.env.example`**
   - Template for environment variables
   - Documents required Stripe keys

### Files that REFERENCE Stripe data:

6. **`/convex/schema.ts`**
   - Stores Stripe customer and subscription IDs

7. **`/convex/sponsorSlots.ts`**
   - Manages sponsor slots linked to Stripe subscriptions

8. **`/components/Footer.tsx`**
   - Contains "Advertise" button linking to upgrade flow

9. **`/app/page.tsx`**
   - Contains "Upgrade to PRO" banner

### Configuration Files:

10. **`.gitignore`**
    - Protects `.env` files from being committed

11. **`package.json`**
    - Stripe dependencies: `stripe`, `@stripe/stripe-js`

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local
# Then edit .env.local with your actual keys

# Start development server
npm run dev

# In a separate terminal, start Stripe webhook forwarding
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Run a test checkout
open http://localhost:3000/upgrade
```

---

## ✅ Final Verification

Before going live, verify:

- [ ] All environment variables set in production
- [ ] Production webhook endpoint configured and tested
- [ ] Live mode Stripe keys active
- [ ] Test transaction completed successfully end-to-end
- [ ] Webhook events being received and processed
- [ ] Database updates happening correctly
- [ ] Email receipts being sent to customers
- [ ] Subscription management working (create, cancel)

---

**Status**: Ready for deployment once all items checked ✓
