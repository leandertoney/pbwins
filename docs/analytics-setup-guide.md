# Analytics Setup Guide

This guide explains how to set up analytics tracking for pbWins FAQ engagement.

---

## 🎯 What's Already Implemented

### Analytics Utility (`lib/analytics.ts`)
- Universal tracking function that works with multiple platforms
- Automatically detects: Google Analytics, Plausible, PostHog, Mixpanel
- Development mode console logging

### Tracked Events:
1. **FAQ Toggle** - When user expands/collapses a question
   - Event: `faq_expand` or `faq_collapse`
   - Category: `FAQ Engagement`
   - Label: `{location}: {question}`

2. **FAQ View** - When FAQ section becomes visible (optional)
   - Event: `faq_viewed`
   - Category: `FAQ Engagement`
   - Label: `leaderboard` or `player-profile`

### Pages with Tracking:
- ✅ Leaderboard (`app/page.tsx`)
- ✅ Player Profiles (via `PlayerFAQSection` component)

---

## 📊 Setup Instructions by Platform

### Option 1: Google Analytics 4 (GA4)

**1. Add GA4 script to your layout:**

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**2. Add to `.env.local`:**
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**3. That's it!** FAQ events will automatically be tracked.

**4. View reports in GA4:**
- Navigate to: **Reports → Engagement → Events**
- Look for: `faq_expand`, `faq_collapse`
- Filter by `event_category = "FAQ Engagement"`

---

### Option 2: Plausible Analytics

**1. Add Plausible script:**

```tsx
// app/layout.tsx
<script
  defer
  data-domain="pbwins.com"
  src="https://plausible.io/js/script.js"
/>
```

**2. Enable custom events in Plausible dashboard:**
- Settings → Goals → Add Custom Event Goal
- Add: `faq_expand`, `faq_collapse`, `faq_viewed`

**3. View events:**
- Main dashboard → Goal Conversions
- Filter by custom events

---

### Option 3: PostHog

**1. Install PostHog:**
```bash
npm install posthog-js
```

**2. Initialize in layout:**

```tsx
// app/layout.tsx
'use client';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://app.posthog.com',
    });
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
```

---

### Option 4: Mixpanel

**1. Install Mixpanel:**
```bash
npm install mixpanel-browser
```

**2. Initialize:**

```tsx
// lib/mixpanel.ts
import mixpanel from 'mixpanel-browser';

if (typeof window !== 'undefined') {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!);
}

export default mixpanel;
```

**3. Add to `.env.local`:**
```env
NEXT_PUBLIC_MIXPANEL_TOKEN=xxxxxxxxxxxxx
```

---

## 🔍 Verifying Tracking is Working

### Development Mode:
1. Open browser DevTools console
2. Click on an FAQ question
3. You should see: `[Analytics] { action: 'faq_expand', category: 'FAQ Engagement', ... }`

### Production Mode:

**Google Analytics:**
- Use [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
- Open FAQ, expand question
- Check console for event fire

**Plausible:**
- Enable test mode: add `?plausible_debug=true` to URL
- Open console, expand FAQ
- Look for event confirmation

**PostHog:**
- Navigate to: Activity → Live Events
- Expand FAQ question
- Should appear within 1-2 seconds

---

## 📈 Creating Custom Dashboards

### Google Analytics 4 Dashboard:

1. **Create Exploration:**
   - Explorations → Create New → Free Form
   - Dimensions: Add `event_name`, `event_label`
   - Metrics: Add `event_count`, `total_users`
   - Filter: `event_category = "FAQ Engagement"`

2. **Key Reports to Create:**
   - Most Popular FAQ Questions (by `event_label`)
   - FAQ Engagement Rate (users who triggered FAQ event / total users)
   - FAQ → Verify Conversion Funnel

### Plausible Dashboard:

1. **Add Goals:**
   - `faq_expand` → Track how many users engage
   - `verify_after_faq` → Track conversions

2. **Create Funnels:**
   - Step 1: Page view
   - Step 2: FAQ expand
   - Step 3: Verify button click

### PostHog Dashboard:

1. **Create Insight:**
   - Type: Trends
   - Event: `faq_expand`
   - Breakdown: `label` (shows which questions)

2. **Create Funnel:**
   - Step 1: FAQ viewed
   - Step 2: FAQ expanded
   - Step 3: Verify initiated

---

## 🎯 Recommended Analytics Setup

### Minimal (Free):
- **Plausible** - Simple, privacy-friendly, $0 for self-hosted
- Track: FAQ expands, verify clicks

### Standard (Startup):
- **Google Analytics 4** - Free, powerful, industry standard
- Track: Full FAQ engagement, funnels, user flows

### Advanced (Growth):
- **PostHog** or **Mixpanel** - Product analytics, cohorts, retention
- Track: User journeys, A/B tests, feature adoption

---

## 🚨 Privacy & Compliance

### GDPR Compliance:
```tsx
// Only track if user consents
const [cookieConsent, setCookieConsent] = useState(false);

useEffect(() => {
  const consent = localStorage.getItem('analytics_consent');
  if (consent === 'true') {
    // Initialize analytics
  }
}, []);
```

### Best Practices:
- Add cookie consent banner
- Update privacy policy
- Anonymize IP addresses (GA4 does this by default)
- Don't track PII in event labels

---

## 📊 Example Queries

### Most Clicked FAQ Questions:
```sql
-- Google Analytics (BigQuery Export)
SELECT
  event_label,
  COUNT(*) as clicks
FROM `project.dataset.events_*`
WHERE event_name = 'faq_expand'
  AND event_category = 'FAQ Engagement'
GROUP BY event_label
ORDER BY clicks DESC
LIMIT 10
```

### FAQ Engagement Rate:
```sql
-- Users who interacted with FAQ / Total users
SELECT
  COUNT(DISTINCT CASE WHEN event_name = 'faq_expand' THEN user_pseudo_id END) /
  COUNT(DISTINCT user_pseudo_id) * 100 as engagement_rate
FROM `project.dataset.events_*`
WHERE event_date = CURRENT_DATE()
```

---

## 🔧 Troubleshooting

### Events Not Showing Up:

1. **Check browser console** - Is event firing?
2. **Verify script loaded** - Check Network tab for analytics script
3. **Check ad blockers** - Disable and test
4. **Check environment variable** - Is tracking ID set?
5. **Wait 24-48 hours** - Some platforms have processing delay

### Events Firing Multiple Times:

- Check for duplicate `onToggle` handlers
- Ensure React isn't re-rendering unnecessarily
- Add event debouncing if needed

---

## ✅ Post-Setup Checklist

- [ ] Analytics platform chosen and configured
- [ ] Tracking script added to layout
- [ ] Environment variables set
- [ ] FAQ events firing in development console
- [ ] FAQ events visible in analytics dashboard
- [ ] Custom dashboard/reports created
- [ ] Team has access to analytics
- [ ] Privacy policy updated
- [ ] Cookie consent implemented (if needed)
- [ ] Documentation shared with team

---

## 📚 Additional Resources

- [Google Analytics 4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Plausible Custom Events](https://plausible.io/docs/custom-event-goals)
- [PostHog Event Tracking](https://posthog.com/docs/integrate/client/js)
- [Mixpanel Event Tracking](https://developer.mixpanel.com/docs/javascript)
