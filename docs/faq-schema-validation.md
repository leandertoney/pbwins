# FAQ Schema Validation Guide

## ✅ Schema Implementation Status

Both leaderboard and player profile pages now include proper JSON-LD structured data for FAQPage schema.

### Files with FAQ Schema:
- `app/page.tsx` (Leaderboard) - Lines 642-700
- `app/players/[slug]/page.tsx` (Player Profiles) - Lines 206-256

---

## 🔍 How to Validate FAQ Schema

### Method 1: Google Rich Results Test (Recommended)

Once deployed to production:

1. Visit [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter your page URL:
   - `https://pbwins.com` (leaderboard)
   - `https://pbwins.com/players/[any-player-slug]` (player profile)
3. Click "Test URL"
4. Check for:
   - ✅ "Page is eligible for rich results"
   - ✅ FAQPage schema detected
   - ✅ No errors or warnings

### Method 2: Schema.org Validator

1. Visit [Schema.org Validator](https://validator.schema.org/)
2. Copy the rendered HTML source
3. Paste into validator
4. Check for schema.org compliance

### Method 3: Manual HTML Inspection

In production:
```bash
# View rendered JSON-LD
curl https://pbwins.com | grep -A 50 'application/ld+json'
```

---

## ✅ Schema Structure Validation Checklist

### Required Fields Present:
- [x] `@context: "https://schema.org"`
- [x] `@type: "FAQPage"`
- [x] `mainEntity` array with Question objects
- [x] Each Question has `@type: "Question"`
- [x] Each Question has `name` (the question text)
- [x] Each Question has `acceptedAnswer` object
- [x] Each Answer has `@type: "Answer"`
- [x] Each Answer has `text` (the answer content)

### Best Practices Followed:
- [x] HTML and JSON-LD content match exactly
- [x] Questions are clear and conversational
- [x] Answers are complete and helpful (no truncation)
- [x] No HTML tags in JSON-LD text fields
- [x] Proper escaping of quotes and special characters

---

## 🧪 Testing Post-Deployment

### Expected Google Search Console Results:
1. **Search Console → Enhancements → FAQs**
   - Should show FAQ-eligible pages within 3-7 days
   - Check "Valid" count increases

2. **Search Appearance:**
   - FAQ rich snippets may appear in Google Search
   - Look for expandable question boxes in SERP

3. **Performance Tracking:**
   - Monitor CTR improvements on FAQ-enabled pages
   - Track impressions for FAQ-enhanced results

---

## 🚨 Common Issues & Fixes

### Issue: "FAQ not detected"
**Fix:** Ensure JSON-LD script is in `<head>` or `<body>`, not commented out

### Issue: "Duplicate questions"
**Fix:** Each question must be unique across the page

### Issue: "Answer too short"
**Fix:** Answers should be at least 40-50 characters

### Issue: "HTML in JSON-LD"
**Fix:** Remove `<strong>`, `<em>` tags from JSON-LD text (keep in visible HTML only)

---

## 📊 Current FAQ Questions

### Leaderboard Page (6 questions):
1. What is a pickleball ranking?
2. How do pickleball ratings work?
3. What does a 3.5 pickleball rating mean?
4. How are pickleball player rankings calculated?
5. What is Parris Todd's pickleball ranking?
6. What's the difference between pickleball rankings and pickleball ratings?

### Player Profile Pages (5 questions):
1. How do I update my pbWins player profile?
2. What are verified wins on pbWins?
3. How does pbWins calculate leaderboard rankings?
4. What does the DUPR rating on my profile mean?
5. How often does pbWins update player stats?

---

## 🎯 Next Steps After Deployment

1. Submit sitemap to Google Search Console
2. Request indexing for key pages with FAQs
3. Monitor Rich Results report (7-14 days)
4. Track SERP appearance with rank tracking tools
5. Iterate on questions based on Search Console queries
