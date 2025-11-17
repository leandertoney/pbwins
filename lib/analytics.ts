/**
 * Analytics tracking utilities for pbWins
 * Works with Google Analytics, Plausible, PostHog, Mixpanel, etc.
 */

// Type definitions for analytics events
export type AnalyticsEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

/**
 * Track a custom event
 * Automatically detects and uses the available analytics platform
 */
export function trackEvent({ action, category, label, value }: AnalyticsEvent): void {
  // Google Analytics (gtag.js)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Google Analytics 4 (GA4)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      category: category,
      label: label,
      value: value,
    });
  }

  // Plausible Analytics
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(action, {
      props: {
        category: category,
        label: label,
        value: value,
      },
    });
  }

  // PostHog
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(action, {
      category: category,
      label: label,
      value: value,
    });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(action, {
      category: category,
      label: label,
      value: value,
    });
  }

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', { action, category, label, value });
  }
}

/**
 * Track FAQ interaction events
 */
export function trackFAQToggle(question: string, isOpen: boolean, location: 'leaderboard' | 'player-profile'): void {
  trackEvent({
    action: isOpen ? 'faq_expand' : 'faq_collapse',
    category: 'FAQ Engagement',
    label: `${location}: ${question}`,
  });
}

/**
 * Track FAQ view (when section becomes visible)
 */
export function trackFAQView(location: 'leaderboard' | 'player-profile'): void {
  trackEvent({
    action: 'faq_viewed',
    category: 'FAQ Engagement',
    label: location,
  });
}
