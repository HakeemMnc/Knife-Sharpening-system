import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type UserRole = 'platform_admin' | 'operator' | 'client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string | null;
  display_name: string | null;
}

/**
 * Create a Supabase client for server-side operations using the user's session.
 * This enforces RLS policies based on the authenticated user.
 */
export function createServerSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');

  // Try to get token from Authorization header first, then from cookie
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Create client with the user's token for RLS enforcement
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  return client;
}

/**
 * Get the authenticated user from the request.
 * Returns null if not authenticated.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Try cookie-based auth
    const sbAccessToken = request.cookies.get('sb-access-token')?.value;
    if (sbAccessToken) {
      token = sbAccessToken;
    }
  }

  if (!token) return null;

  try {
    // Verify the token and get user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Get profile with role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, tenant_id, display_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role as UserRole,
      tenant_id: profile.tenant_id,
      display_name: profile.display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the user or a 401 response.
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return user;
}

/**
 * Require a specific role. Returns the user or a 403 response.
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return result;
}

/**
 * Check if a request is from a webhook (Stripe/Twilio) based on known headers.
 */
export function isWebhookRequest(request: NextRequest): boolean {
  // Stripe sends stripe-signature header
  if (request.headers.get('stripe-signature')) return true;
  // Twilio sends X-Twilio-Signature
  if (request.headers.get('x-twilio-signature')) return true;
  return false;
}

/**
 * Check if a request is from a cron job.
 */
export function isCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Sign in with email and password (client-side helper).
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out (client-side helper).
 */
export async function signOut() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase.auth.signOut();
}

/**
 * Get the current session (client-side helper).
 */
export async function getSession() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase.auth.getSession();
}
