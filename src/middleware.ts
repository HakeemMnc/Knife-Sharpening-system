import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiRateLimiter, authRateLimiter, rateLimit } from '@/lib/rate-limiter';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

  // For protected routes, check authentication
  const token = extractToken(request);

  if (!token) {
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

  // Verify the token
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated — allow the request
    // Role-based access is enforced at the API route level via requireRole()
    const response = NextResponse.next();
    // Pass user ID to downstream handlers via header
    response.headers.set('x-user-id', user.id);
    return response;

  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try Supabase auth cookie
  const sbAccessToken = request.cookies.get('sb-access-token')?.value;
  if (sbAccessToken) return sbAccessToken;

  // Try supabase-auth-token cookie (Supabase's default cookie name varies)
  for (const [name, cookie] of request.cookies) {
    if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed?.access_token) return parsed.access_token;
      } catch {
        // Not JSON, try as plain token
        if (cookie.value) return cookie.value;
      }
    }
  }

  return null;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
