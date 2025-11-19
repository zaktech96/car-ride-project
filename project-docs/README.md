# Kaizen Docs - Clerk Authentication & Polar.sh Payments Integration

This documentation site uses Clerk for authentication and Polar.sh for payments to gate access to premium content.

## Setup Instructions

### 1. Environment Variables

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `POLAR_API_KEY`: Your Polar.sh API key
- `POLAR_WEBHOOK_SECRET`: Your Polar.sh webhook secret
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000`)

### 2. Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys to `.env.local`
4. Configure your sign-in/sign-up URLs in Clerk dashboard

### 3. Polar.sh Setup

1. Create a Polar.sh account at [polar.sh](https://polar.sh)
2. Create a product and pricing plan
3. Copy your API key to `.env.local`
4. Set up webhooks pointing to `/api/webhooks/polar`
5. Note your price ID for the subscription button

### 4. Database Integration (TODO)

Currently, the system uses placeholder customer IDs. For production:

1. Set up a database to store user-subscription mappings
2. Update `src/app/api/subscription/status/route.ts` to look up Polar.sh customer ID
3. Update `src/app/api/subscription/checkout/route.ts` to store customer ID after first subscription
4. Update `src/app/api/webhooks/polar/route.ts` to handle subscription events

### 5. Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

### 6. Deployment

For Vercel deployment:

1. Set environment variables in Vercel dashboard
2. Deploy using Vercel CLI or GitHub integration
3. Update webhook URLs in Polar.sh dashboard

## Features

- **Authentication**: Clerk handles user sign-in/sign-up
- **Payment Gating**: Only users with active Polar.sh subscriptions can access `/docs`
- **Subscription Management**: API routes for checking and creating subscriptions
- **Webhook Handling**: Processes Polar.sh subscription events
- **UI Integration**: Sign-in buttons and user profile in docs layout

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── subscription/
│   │   │   ├── status/route.ts      # Check subscription status
│   │   │   └── checkout/route.ts     # Create checkout session
│   │   └── webhooks/
│   │       └── polar/route.ts        # Handle Polar.sh webhooks
│   ├── docs/
│   │   └── layout.tsx               # Docs layout with auth UI
│   ├── subscribe/
│   │   └── page.tsx                 # Subscription page
│   └── layout.tsx                   # Root layout with ClerkProvider
├── lib/
│   └── polar.ts                     # Polar.sh SDK integration
└── middleware.ts                     # Route protection middleware
```

## Security Notes

- Webhook signatures should be verified in production
- Customer ID mapping should be stored securely
- API keys should never be exposed to client-side code
- Consider rate limiting for API routes

## Testing

1. Start the development server
2. Try accessing `/docs` without authentication (should redirect to sign-in)
3. Sign in and try accessing `/docs` without subscription (should redirect to subscribe)
4. Test subscription flow (requires valid Polar.sh setup)
5. Verify webhook handling (requires Polar.sh webhook configuration)