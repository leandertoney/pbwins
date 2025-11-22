# Sponsor Onboarding Workflow

Complete documentation for the pbWins sponsor system with favicon integration.

## Overview

The sponsor system allows businesses to purchase monthly placements on the pbWins leaderboard. After payment, sponsors complete an onboarding form to provide their business details, which are then displayed on rotating sponsor circles with automatic favicon fetching.

## User Journey

### 1. Purchase ($499/month)
- Sponsor visits `/upgrade`
- Enters email and completes Stripe checkout
- Redirected to `/success?session_id=xxx`

### 2. Onboarding
- Success page automatically redirects to `/sponsor-onboarding?session_id=xxx`
- Sponsor fills out form:
  - **Business Name** (max 50 chars)
  - **Tagline** (max 60 chars)
  - **Website URL** (for favicon)
- Upon submission, sponsor info is saved and marked as active

### 3. Activation
- Sponsor is redirected back to `/success` (now showing "all set" message)
- Business immediately appears on leaderboard sponsor circles
- Favicon is automatically fetched from their website
- Sponsor rotates through the display every 10 seconds

## Technical Architecture

### Database Schema

```typescript
sponsorSlots: {
  email: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  createdAt: number
  month: string                    // e.g., "November"
  checkoutSessionId: string

  // Onboarding fields
  businessName: string             // Filled during onboarding
  tagline: string                  // Filled during onboarding
  websiteUrl: string               // Filled during onboarding
  isActive: boolean                // Set to true after onboarding
  onboardedAt: number              // Timestamp of onboarding completion
}
```

### Key Files

#### Frontend
- `/app/upgrade/page.tsx` - Payment page ($499/month via Stripe)
- `/app/sponsor-onboarding/page.tsx` - Onboarding form (NEW)
- `/app/success/page.tsx` - Success page with redirect logic
- `/components/SponsorCircle.tsx` - Individual sponsor display with favicon
- `/components/SponsorRailsFixed.tsx` - Dynamic sponsor rotation

#### Backend (Convex)
- `/convex/schema.ts` - Database schema with sponsor fields
- `/convex/sponsorSlots.ts` - Mutations and queries:
  - `updateSponsorInfo` - Save onboarding data
  - `getSponsorByCheckout` - Fetch sponsor by session ID
  - `getActiveSponsors` - Get all active sponsors for current month

#### Data
- `/data/sponsors.ts` - Placeholder sponsors (shown when slots unsold)

### Favicon Integration

Favicons are automatically fetched using Google's favicon service:

```typescript
const getFaviconUrl = (url: string) => {
  const domain = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
```

- Fetched at 64x64 pixels
- Displayed at 16x16 pixels (w-4 h-4)
- Graceful fallback if favicon fails to load
- Only displayed for sponsors with URLs

### Display Logic

1. **Active Sponsors Priority**: Active sponsors (completed onboarding) appear first
2. **Placeholder Fill**: If fewer than 30 sponsors, placeholders fill remaining slots
3. **Rotation**: All 10 visible slots rotate every 10 seconds
4. **Monthly**: Sponsors are fetched based on current month

## Testing

### Automated Tests

Run the complete workflow test:

```bash
NEXT_PUBLIC_CONVEX_URL=https://next-viper-38.convex.cloud node scripts/test-sponsor-workflow.mjs
```

This tests:
- ✅ Payment simulation
- ✅ Onboarding form submission
- ✅ Sponsor activation
- ✅ Active sponsors query
- ✅ Favicon fetching

### Manual Testing

Add a test sponsor to see it live:

```bash
NEXT_PUBLIC_CONVEX_URL=https://next-viper-38.convex.cloud node scripts/add-test-sponsor.mjs
```

Then visit `http://localhost:3002` to see the sponsor circle with favicon.

### Cleanup

View test sponsors:

```bash
NEXT_PUBLIC_CONVEX_URL=https://next-viper-38.convex.cloud node scripts/cleanup-test-sponsors.mjs
```

## Production Deployment

### 1. Deploy Schema Changes

```bash
npx convex deploy
```

### 2. Deploy Next.js Application

```bash
npm run build
# Deploy to your hosting provider (Vercel, Netlify, etc.)
```

### 3. Verify Environment Variables

Ensure these are set in production:
- `NEXT_PUBLIC_CONVEX_URL` - Production Convex URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Workflow States

### State 1: Payment Completed, Not Onboarded
- `checkoutSessionId`: Set
- `isActive`: `undefined` or `false`
- **Action**: Redirect to `/sponsor-onboarding`

### State 2: Onboarding Completed
- `businessName`, `tagline`, `websiteUrl`: Set
- `isActive`: `true`
- `onboardedAt`: Timestamp
- **Result**: Appears on leaderboard immediately

### State 3: Subscription Cancelled
- Entry deleted from database
- Removed from active sponsors list

## Edge Cases

### Favicon Fails to Load
- Component uses `onError` handler
- Sets `faviconError` state to `true`
- Hides favicon, shows only text

### Sponsor Revisits Success Page
- If `isActive = false`: Redirects to onboarding
- If `isActive = true`: Shows success message

### Invalid Session ID
- Shows error message
- Provides support contact

### Duplicate Onboarding
- Prevented by checking `isActive` state
- User sees success page if already completed

## Support Workflow

When sponsors need help:

1. They contact support@pbwins.com
2. Support can look up by email in Convex dashboard
3. Check sponsor state (active, pending onboarding, etc.)
4. Manually update fields if needed

## Future Enhancements

Potential improvements:
- [ ] Allow sponsors to edit their info after onboarding
- [ ] Upload custom logo instead of favicon
- [ ] Analytics dashboard for impression counts
- [ ] A/B testing different taglines
- [ ] Sponsor tier system (premium placement)
- [ ] Sponsor portal for self-service management

## Troubleshooting

### Sponsor Not Appearing

1. Check if `isActive = true` in database
2. Verify `month` matches current month
3. Check Convex query in browser console
4. Ensure `NEXT_PUBLIC_CONVEX_URL` is correct

### Favicon Not Showing

1. Verify URL is valid (includes https://)
2. Test favicon URL directly in browser
3. Check browser console for CORS errors
4. Fallback: Only text displays (working as designed)

### Onboarding Form Not Saving

1. Check Convex function logs
2. Verify `checkoutSessionId` is valid
3. Ensure all required fields are filled
4. Check URL validation (must be valid URL)

## Metrics to Track

Consider tracking:
- Conversion rate (payment → onboarding completion)
- Time between payment and onboarding
- Favicon load success rate
- Sponsor circle impression counts
- Click-through rates on sponsor URLs
