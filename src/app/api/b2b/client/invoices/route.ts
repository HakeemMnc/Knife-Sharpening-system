import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { B2BDatabaseService } from '@/lib/b2b-database';
import { StripeConnectService } from '@/lib/stripe-connect';

// GET: Client's invoices from Stripe
export async function GET(request: NextRequest) {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'client' || !result.client_id) {
    return NextResponse.json({ error: 'Client access required' }, { status: 403 });
  }

  try {
    const client = await B2BDatabaseService.getClient(result.client_id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!client.stripe_customer_id) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get the tenant to find the connected Stripe account
    const tenant = await B2BDatabaseService.getTenant(client.tenant_id);
    if (!tenant?.stripe_account_id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const invoices = await StripeConnectService.listInvoices(
      client.stripe_customer_id,
      tenant.stripe_account_id
    );

    // Return simplified invoice data
    const simplifiedInvoices = invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount_due: inv.amount_due,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      due_date: inv.due_date,
      period_start: inv.period_start,
      period_end: inv.period_end,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
    }));

    return NextResponse.json({ success: true, data: simplifiedInvoices });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invoices';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
