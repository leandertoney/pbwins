# Development Guide

## Pre-Push Validation

To avoid build failures on Netlify, **always run validation before pushing**:

```bash
npm run validate
```

This checks:
- ✅ TypeScript types (`tsc --noEmit`)
- ✅ ESLint rules (`next lint`)

### Why This Matters

Netlify runs `next build` which includes TypeScript and ESLint checks. If these fail, your deployment will fail. Running `npm run validate` locally catches these issues **before** you push.

### What Gets Checked

1. **TypeScript Type Errors**: Catches `any` types, missing imports, type mismatches, etc.
2. **ESLint Errors**: Catches unused variables, style violations, and code quality issues

### Example Workflow

```bash
# Make your changes
git add .

# Validate before committing
npm run validate

# If validation passes, commit and push
git commit -m "your message"
git push origin main
```

### Manual Build Test (Optional)

For extra confidence, you can run a full production build:

```bash
npm run build
```

This takes longer but catches any build-time issues that TypeScript/ESLint might miss.

## Common Issues

### "useQuery is defined but never used"
Remove unused imports from your files.

### "Unexpected any. Specify a different type"
Replace `any` with explicit interfaces:
```typescript
// Bad
const data: any = ...

// Good
interface MyData {
  id: string;
  name: string;
}
const data: MyData = ...
```

### Type 'string' is not assignable to type 'Id<"players">'
Cast string IDs to proper Convex ID types:
```typescript
playerId as Id<"players">
```
