'use client';

import { useState, useEffect } from 'react';
import type { TenantSummary } from '@/types/b2b';

export default function TenantsTab() {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/b2b/platform/analytics?view=tenants');
        const result = await response.json();
        if (result.success) {
          setTenants(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/b2b/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTenants(prev =>
          prev.map(t => t.id === tenantId ? { ...t, status: newStatus as TenantSummary['status'] } : t)
        );
      }
    } catch (error) {
      console.error('Failed to update tenant status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading operators...</div>;
  }

  const filtered = filter === 'all'
    ? tenants
    : tenants.filter(t => t.status === filter || t.platform_subscription_status === filter);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-yellow-100 text-yellow-800',
      onboarding: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      past_due: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Operators ({filtered.length})
        </h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="onboarding">Onboarding</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No operators found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(tenant => (
            <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <p className="text-sm text-gray-500">
                    {tenant.business_email || 'No email'} &middot; {tenant.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(tenant.status)}`}>
                    {tenant.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(tenant.platform_subscription_status)}`}>
                    {tenant.platform_plan} ({tenant.platform_subscription_status})
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                <span>{tenant.client_count} clients</span>
                <span>{tenant.visit_count} visits</span>
                <span>Last active: {tenant.last_activity ? new Date(tenant.last_activity).toLocaleDateString() : 'Never'}</span>
                <span>Joined: {new Date(tenant.created_at).toLocaleDateString()}</span>
              </div>

              <div className="mt-3 flex gap-2">
                {tenant.status !== 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(tenant.id, 'suspended')}
                    className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    Suspend
                  </button>
                )}
                {tenant.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(tenant.id, 'active')}
                    className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
