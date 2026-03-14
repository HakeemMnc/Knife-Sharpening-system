import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST: Operator invites a client to the portal (creates auth user + links profile)
export async function POST(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'operator' && result.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Operator access required' }, { status: 403 });
  }

  if (!result.tenant_id) {
    return NextResponse.json({ error: 'No tenant associated with this account' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { client_id } = body;

    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 });
    }

    const client = await B2BDatabaseService.getClient(client_id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (client.tenant_id !== result.tenant_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client has no email address. Add an email first.' }, { status: 400 });
    }

    // Create auth user with client role using Supabase Admin API
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Use inviteUserByEmail to send a magic link
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      client.email,
      {
        data: {
          role: 'client',
          display_name: client.contact_name || client.business_name,
        },
      }
    );

    if (inviteError) {
      // If user already exists, just link them
      if (inviteError.message?.includes('already been registered')) {
        // Find the existing user and update their profile
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === client.email);

        if (existingUser) {
          await adminClient
            .from('profiles')
            .update({ role: 'client', client_id: client.id, tenant_id: client.tenant_id })
            .eq('id', existingUser.id);

          return NextResponse.json({
            success: true,
            data: { message: 'Existing user linked to client portal', userId: existingUser.id },
          });
        }
      }

      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    // Update the new user's profile with client_id and tenant_id
    if (inviteData?.user) {
      await adminClient
        .from('profiles')
        .update({ role: 'client', client_id: client.id, tenant_id: client.tenant_id })
        .eq('id', inviteData.user.id);
    }

    return NextResponse.json({
      success: true,
      data: { message: `Invitation sent to ${client.email}`, userId: inviteData?.user?.id },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to invite client';
    console.error('Client invite error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
