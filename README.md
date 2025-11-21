# pbWins - Pickleball Leaderboard

A Next.js application for tracking pickleball player ratings and performance, integrated with DUPR data and featuring sponsored placement opportunities.

## Features

- 📊 Real-time pickleball leaderboard with DUPR integration
- 💳 Stripe-powered sponsor subscription system ($499/month)
- 🔄 Automated data syncing and match history tracking
- 📱 Responsive design for desktop and mobile
- 🛡️ Admin panel for management
- ⚡ Built with Next.js 15, TypeScript, and Convex

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account
- Stripe account (for payment processing)
- Browserless token (for DUPR scraping)

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables** in `.env.local`:
   - `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
   - `STRIPE_SECRET_KEY` - Stripe secret key (test mode for development)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `NEXT_PUBLIC_APP_URL` - Application URL (http://localhost:3000 for local)
   - `BROWSERLESS_TOKEN` - Browserless API token
   - `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin panel password

   See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed Stripe configuration instructions.

### Installation & Development

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

For Stripe webhook testing, run in a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the leaderboard.

## Project Structure

```
pbwins/
├── app/
│   ├── api/
│   │   ├── checkout/        # Stripe checkout session creation
│   │   └── stripe/webhook/  # Stripe webhook event handler
│   ├── upgrade/             # Sponsor subscription page
│   ├── success/             # Post-checkout success page
│   └── cancel/              # Checkout cancellation page
├── components/              # React components
├── convex/                  # Convex database schema and functions
│   ├── schema.ts           # Database schema
│   └── sponsorSlots.ts     # Sponsor slot management
├── lib/                     # Utility functions
└── public/                  # Static assets
```

## Documentation

- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Complete Stripe configuration guide
- **[STRIPE_CHECKLIST.md](./STRIPE_CHECKLIST.md)** - Stripe setup checklist
- **[.env.example](./.env.example)** - Environment variables template

## Key Features

### Sponsor Subscription System

- Monthly sponsor slots at $499/month
- Limited to 20 sponsors per month
- Automated subscription management via Stripe
- Webhook-driven database updates
- Rotating sponsor visibility on leaderboard

### DUPR Integration

- Automated player data fetching
- Match history tracking
- Rating updates and statistics

## Testing Stripe Integration

Use Stripe test cards for development:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure authentication |

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for comprehensive testing instructions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
