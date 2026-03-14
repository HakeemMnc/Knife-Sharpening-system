'use client';

import { useState, useEffect } from 'react';
import type { Tenant } from '@/types/b2b';

interface StripeStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  onboardingComplete?: boolean;
  dashboardUrl?: string | null;
}

export default function SettingsTab() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const [form, setForm] = useState({
    name: '',
    business_name: '',
    business_email: '',
    business_phone: '',
    abn: '',
    timezone: '',
    default_service_radius_km: 50,
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/b2b/tenants');
        const result = await response.json();
        if (result.success && result.data) {
          setTenant(result.data);
          setForm({
            name: result.data.name,
            business_name: result.data.business_name || '',
            business_email: result.data.business_email || '',
            business_phone: result.data.business_phone || '',
            abn: result.data.abn || '',
            timezone: result.data.timezone,
            default_service_radius_km: result.data.default_service_radius_km,
          });
        }
      } catch (err) {
        console.error('Failed to fetch tenant:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, []);

  // Fetch Stripe Connect status
  useEffect(() => {
    if (!tenant) return;
    fetchStripeStatus();
  }, [tenant]);

  // Handle Stripe redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeResult = params.get('stripe');
    if (stripeResult === 'success') {
      setMessage('Stripe account connected successfully!');
      fetchStripeStatus();
    } else if (stripeResult === 'pending') {
      setMessage('Stripe onboarding is not complete yet. Please finish setting up your account.');
    } else if (stripeResult === 'error') {
      setMessage('Something went wrong with Stripe setup. Please try again.');
    }
  }, []);

  const fetchStripeStatus = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch('/api/b2b/stripe/connect');
      const result = await response.json();
      if (result.success) {
        setStripeStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe status:', err);
    } finally {
      setStripeLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    setMessage('');

    try {
      const response = await fetch('/api/b2b/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.success && result.data.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      } else {
        setMessage(result.error || 'Failed to start Stripe setup');
        setConnectingStripe(false);
      }
    } catch {
      setMessage('Something went wrong starting Stripe setup');
      setConnectingStripe(false);
    }
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/b2b/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
      } else {
        const result = await response.json();
        setMessage(result.error || 'Failed to save settings');
      }
    } catch {
      setMessage('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading settings...</div>;
  }

  if (!tenant) {
    return <div className="text-center py-8 text-red-500">Failed to load settings</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold">Business Settings</h2>

      {message && (
        <div className={`p-3 rounded text-sm ${
          message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trading Name</label>
          <input
            type="text"
            value={form.business_name}
            onChange={e => setForm(prev => ({ ...prev, business_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.business_email}
              onChange={e => setForm(prev => ({ ...prev, business_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.business_phone}
              onChange={e => setForm(prev => ({ ...prev, business_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ABN</label>
          <input
            type="text"
            value={form.abn}
            onChange={e => setForm(prev => ({ ...prev, abn: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={form.timezone}
              onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Australia/Sydney">Sydney (AEST)</option>
              <option value="Australia/Melbourne">Melbourne (AEST)</option>
              <option value="Australia/Brisbane">Brisbane (AEST)</option>
              <option value="Australia/Perth">Perth (AWST)</option>
              <option value="Australia/Adelaide">Adelaide (ACST)</option>
              <option value="Pacific/Auckland">Auckland (NZST)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="America/Los_Angeles">Los Angeles (PST)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
            <input
              type="number"
              value={form.default_service_radius_km}
              onChange={e => setForm(prev => ({ ...prev, default_service_radius_km: parseInt(e.target.value) || 50 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min={5}
              max={200}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <div className="text-sm text-gray-500">
          Tenant ID: <code className="bg-gray-100 px-1 rounded">{tenant.id}</code>
        </div>
      </div>

      {/* Stripe Connect Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Stripe Payments</h3>

        {stripeLoading ? (
          <div className="text-sm text-gray-500">Checking Stripe status...</div>
        ) : stripeStatus?.onboardingComplete ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">Stripe Connected</p>
                  <p className="text-sm text-green-600 mt-1">Your Stripe account is active and ready to receive payments.</p>
                </div>
                <div className="flex items-center gap-2">
                  {stripeStatus.chargesEnabled && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Charges</span>
                  )}
                  {stripeStatus.payoutsEnabled && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Payouts</span>
                  )}
                </div>
              </div>
            </div>
            {stripeStatus.dashboardUrl && (
              <a
                href={stripeStatus.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                Open Stripe Dashboard
              </a>
            )}
          </div>
        ) : stripeStatus?.connected && stripeStatus?.detailsSubmitted === false ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">Stripe Setup Incomplete</p>
            <p className="text-sm text-yellow-600 mt-1">You started connecting your Stripe account but haven&apos;t finished. Click below to continue.</p>
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium disabled:opacity-50"
            >
              {connectingStripe ? 'Redirecting...' : 'Continue Stripe Setup'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 font-medium">Connect Your Stripe Account</p>
            <p className="text-sm text-gray-600 mt-1">
              Connect your Stripe account to automatically bill clients for completed visits.
              Stripe Express handles payments, invoicing, and payouts.
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {connectingStripe ? 'Redirecting to Stripe...' : 'Connect with Stripe'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
