#!/bin/bash

# Pre-push validation script
# Runs the same checks that Netlify build does

echo "🔍 Running pre-push validation..."
echo ""

# 1. TypeScript type checking (most critical)
echo "📝 Checking TypeScript types..."
if ! npx tsc --noEmit; then
  echo ""
  echo "❌ TypeScript errors found!"
  echo "Fix these errors before pushing to avoid build failures."
  exit 1
fi
echo "✅ TypeScript checks passed"
echo ""

# 2. ESLint (what Next.js build runs) - suppress circular reference warning
echo "🔎 Running ESLint..."
if npx next lint 2>&1 | grep -v "Converting circular structure" | grep "Error:"; then
  echo ""
  echo "❌ ESLint errors found!"
  exit 1
fi
echo "✅ ESLint checks passed"
echo ""

# 3. Optional: Run a quick build to catch any other issues
# Uncomment if you want full build validation (slower but more thorough)
# echo "🏗️  Running production build..."
# if ! npm run build; then
#   echo ""
#   echo "❌ Build failed!"
#   exit 1
# fi
# echo "✅ Build successful"
# echo ""

echo "✨ All validation checks passed! Safe to push."
