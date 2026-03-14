'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  due_date: number | null;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

export default function BillingTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/b2b/client/invoices');
        const result = await response.json();
        if (result.success) setInvoices(result.data);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const statusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-600',
      uncollectible: 'bg-red-100 text-red-800',
      void: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status || 'draft'] || 'bg-gray-100 text-gray-600'}`}>
        {status || 'draft'}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading billing...</div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 mb-2">No invoices yet</p>
        <p className="text-sm text-gray-500">
          Your invoices will appear here once billing begins for your service contract.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {invoices.map(invoice => (
          <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {invoice.number || 'Draft Invoice'}
                  </p>
                  {statusBadge(invoice.status)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <p>Period: {formatDate(invoice.period_start)} &mdash; {formatDate(invoice.period_end)}</p>
                  {invoice.due_date && (
                    <p>Due: {formatDate(invoice.due_date)}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {formatAmount(invoice.amount_due, invoice.currency)}
                </p>
                {invoice.amount_paid > 0 && (
                  <p className="text-xs text-green-600">
                    Paid: {formatAmount(invoice.amount_paid, invoice.currency)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {invoice.hosted_invoice_url && (
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Invoice
                </a>
              )}
              {invoice.invoice_pdf && (
                <a
                  href={invoice.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Download PDF
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
