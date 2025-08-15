# Environment Variables Setup

## Create .env.local file

Create a file called `.env.local` in your project root with these values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration (Get these from your Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Steps:

1. Create `.env.local` file in your project root
2. Copy and paste the above content
3. Save the file
4. Restart your development server

## Test the setup:

```bash
nvm use 20.19.4
npm run dev
```

Your application should now work without the module resolution errors!
