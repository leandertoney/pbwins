# FAQ A/B Testing Guide

This document outlines different FAQ placement strategies and how to A/B test them for optimal engagement.

---

## 🎯 Current Implementation

### Leaderboard Page (`app/page.tsx`)
- **Position:** Bottom of page, above footer
- **Layout:** Full-width (max-w-4xl), centered
- **Container:** Outside main content area
- **Rationale:** Users who scroll to bottom are highly engaged and looking for more info

### Player Profile Page (`app/players/[slug]/page.tsx`)
- **Position:** After "Recent Verified Wins" section
- **Layout:** Full-width within profile container
- **Container:** Inside main content section
- **Rationale:** Natural progression after viewing player stats

---

## 🧪 A/B Test Variants

### Variant A: Current Position (Control)
**Leaderboard:** Bottom, above footer
**Profile:** After verified wins

**Pros:**
- Non-intrusive
- Captures highly engaged users
- Doesn't disrupt primary content flow

**Cons:**
- May be missed by users who don't scroll fully
- Lower visibility

**Best for:** Users seeking detailed information

---

### Variant B: Above-the-Fold Placement

**Leaderboard Position:**
```tsx
// Place FAQ immediately after leaderboard title, before filters
<section className="mt-8 mb-12 max-w-4xl mx-auto px-6">
  {/* FAQ content */}
</section>
```

**Profile Position:**
```tsx
// Place FAQ right after player header card, before bio
<section className="mt-8">
  {/* FAQ content */}
</section>
```

**Pros:**
- Maximum visibility
- Immediate access to help content
- May reduce bounce rate for confused users

**Cons:**
- Pushes primary content down
- May feel overwhelming
- Could hurt engagement with core features

**Best for:** New user onboarding, reducing support tickets

---

### Variant C: Sticky Sidebar

**Implementation:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
  {/* Main content */}
  <div>
    {/* Leaderboard or profile content */}
  </div>

  {/* Sticky FAQ Sidebar */}
  <aside className="hidden lg:block">
    <div className="sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Quick Help</h3>
      {/* Compact FAQ with 3-4 top questions */}
    </div>
  </aside>
</div>
```

**Pros:**
- Always visible while scrolling
- Doesn't interrupt main content flow
- Premium feel

**Cons:**
- Reduces horizontal space for main content
- Not mobile-friendly
- More complex implementation

**Best for:** Desktop users, content-heavy pages

---

### Variant D: Collapsible Top Banner

**Implementation:**
```tsx
<div className="mb-8 border-b border-white/10 pb-6">
  <button
    onClick={() => setShowFAQ(!showFAQ)}
    className="flex items-center gap-2 text-brand-light hover:text-brand"
  >
    <svg className="w-5 h-5">...</svg>
    Need help? View FAQ
  </button>

  {showFAQ && (
    <div className="mt-4 space-y-3">
      {/* Compact FAQ items */}
    </div>
  )}
</div>
```

**Pros:**
- Visible but not intrusive
- User-initiated (shows intent)
- Minimal space when collapsed

**Cons:**
- Extra click required
- May be ignored
- Lower discovery

**Best for:** Power users, clean UI preference

---

### Variant E: Modal/Popover

**Implementation:**
```tsx
// Add floating help button
<button
  onClick={() => setShowFAQModal(true)}
  className="fixed bottom-6 right-6 z-50 rounded-full bg-brand text-black p-4 shadow-lg hover:scale-110 transition"
>
  <svg className="w-6 h-6">?</svg>
</button>

{showFAQModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#0E1414] rounded-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
      {/* Full FAQ content */}
    </div>
  </div>
)}
```

**Pros:**
- Always accessible
- Doesn't take up page space
- Modern UX pattern

**Cons:**
- Can feel like "hiding" help
- Requires extra interaction
- May be annoying if persistent

**Best for:** Mobile users, clean layouts

---

## 📊 How to Implement A/B Testing

### Option 1: Feature Flag (Simple)

Add to environment variables:
```env
NEXT_PUBLIC_FAQ_VARIANT=control  # or: above-fold, sidebar, banner, modal
```

Implement conditional rendering:
```tsx
// app/page.tsx
const faqVariant = process.env.NEXT_PUBLIC_FAQ_VARIANT || 'control';

// Render different FAQ positions based on variant
{faqVariant === 'control' && <FAQSectionBottom />}
{faqVariant === 'above-fold' && <FAQSectionTop />}
{faqVariant === 'sidebar' && <FAQSidebar />}
// etc.
```

### Option 2: Cookie-Based Split

```tsx
'use client';
import { useEffect, useState } from 'react';

export default function ABTestFAQ() {
  const [variant, setVariant] = useState<'a' | 'b'>('a');

  useEffect(() => {
    // Check if user already has a variant assigned
    const existingVariant = document.cookie
      .split('; ')
      .find(row => row.startsWith('faq_variant='))
      ?.split('=')[1];

    if (existingVariant) {
      setVariant(existingVariant as 'a' | 'b');
    } else {
      // Randomly assign variant (50/50 split)
      const newVariant = Math.random() < 0.5 ? 'a' : 'b';
      document.cookie = `faq_variant=${newVariant}; path=/; max-age=2592000`; // 30 days
      setVariant(newVariant);
    }
  }, []);

  return variant === 'a' ? <FAQVariantA /> : <FAQVariantB />;
}
```

### Option 3: Third-Party A/B Testing Tools

**Google Optimize:**
```html
<!-- Add to app/layout.tsx -->
<script src="https://www.googleoptimize.com/optimize.js?id=OPT-XXXXX"></script>
```

**Optimizely:**
```tsx
import { OptimizelyProvider } from '@optimizely/react-sdk';

export default function App({ Component, pageProps }) {
  return (
    <OptimizelyProvider
      optimizely={optimizelyClient}
      user={{ id: userId }}
    >
      <Component {...pageProps} />
    </OptimizelyProvider>
  );
}
```

---

## 📈 Metrics to Track

### Primary Metrics:
- **FAQ Engagement Rate:** % of users who expand at least one question
- **Questions per Session:** Average number of FAQs opened
- **Time on FAQ:** How long users spend reading FAQs
- **FAQ → Verify Conversion:** % who verify profile after viewing FAQ

### Secondary Metrics:
- **Page Scroll Depth:** How far users scroll (affects bottom placement)
- **Bounce Rate:** Overall page bounce rate per variant
- **Session Duration:** Total time on site
- **Return Visits:** Do FAQ readers come back?

### Event Tracking:
```typescript
// Already implemented in lib/analytics.ts
trackFAQToggle(question, isOpen, location);
trackFAQView(location);

// Add conversion tracking:
trackEvent({
  action: 'verify_after_faq',
  category: 'Conversion',
  label: `FAQ Variant ${variant}`,
});
```

---

## 🎓 Best Practices

### Sample Size Calculator:
- Minimum 1,000 users per variant
- Run for at least 2 weeks to account for weekly patterns
- Statistical significance: p-value < 0.05

### Avoid Testing Pitfalls:
1. **Don't** change test mid-experiment
2. **Don't** test multiple changes at once
3. **Don't** stop test early based on initial results
4. **Do** test one page/section at a time
5. **Do** document results and learnings

### Winner Criteria:
- **Engagement:** 20%+ increase in FAQ interactions
- **Conversion:** 10%+ increase in verifications
- **UX:** No negative impact on primary metrics

---

## 🚀 Recommended Test Sequence

1. **Week 1-2:** Control vs. Above-fold placement
2. **Week 3-4:** Winner vs. Sidebar (desktop only)
3. **Week 5-6:** Winner vs. Modal/popover (mobile only)
4. **Week 7+:** Implement winning variant, optimize questions

---

## 📝 Implementation Checklist

- [ ] Choose A/B testing method (feature flag, cookie, or tool)
- [ ] Implement analytics tracking for all variants
- [ ] Create variant components
- [ ] Set up conversion tracking
- [ ] Document test parameters (sample size, duration)
- [ ] Run test
- [ ] Analyze results
- [ ] Implement winner
- [ ] Document learnings
