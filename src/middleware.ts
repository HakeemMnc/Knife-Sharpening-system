import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { apiRateLimiter, authRateLimiter, rateLimit } from '@/lib/rate-limiter';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/api/payments/webhook',    // Stripe webhook (uses signature verification)
  '/api/sms/webhook',         // Twilio webhook (uses signature verification)
  '/api/cron',                // Cron jobs (use CRON_SECRET)
  '/api/contact',             // Public contact form
  '/api/coupons/validate',    // Public coupon validation (during B2C transition)
];

// Route prefixes that are public (location landing pages during B2C transition)
const PUBLIC_PREFIXES = [
  '/knife-sharpening-',
  '/_next',
  '/favicon',
  '/logo',
  '/api/payments/webhook',
  '/api/sms/webhook',
  '/api/cron/',
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes (but apply rate limiting to public API endpoints)
  if (isPublicRoute(pathname)) {
    // Rate limit public API endpoints (contact form, coupon validation)
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/payments/webhook') && !pathname.startsWith('/api/sms/webhook') && !pathname.startsWith('/api/cron')) {
      const rateLimitResponse = await rateLimit(request, apiRateLimiter);
      if (rateLimitResponse) return rateLimitResponse;
    }
    // Rate limit login page POST
    if (pathname === '/login' && request.method === 'POST') {
      const rateLimitResponse = await rateLimit(request, authRateLimiter);
      if (rateLimitResponse) return rateLimitResponse;
    }
    return NextResponse.next();
  }

  // Rate limit authenticated API endpoints
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await rateLimit(request, apiRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // Create a response that we can modify (to update cookies if needed)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client that reads/writes cookies properly
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update cookies on the request (for downstream handlers)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Update cookies on the response (to send back to browser)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if expired and set updated cookies
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated — allow the request
  // Role-based access is enforced at the API route level via requireRole()
  response.headers.set('x-user-id', user.id);
  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
