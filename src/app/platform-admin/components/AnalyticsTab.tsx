'use client';

import { useState, useEffect } from 'react';
import type { PlatformAnalytics } from '@/types/b2b';

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/b2b/platform/analytics');
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-gray-500">Failed to load analytics</div>;
  }

  const stats = [
    { label: 'Total Operators', value: analytics.total_tenants, color: 'bg-blue-50 text-blue-700' },
    { label: 'Active', value: analytics.active_tenants, color: 'bg-green-50 text-green-700' },
    { label: 'Trialing', value: analytics.trialing_tenants, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Suspended', value: analytics.suspended_tenants, color: 'bg-red-50 text-red-700' },
    { label: 'MRR', value: `$${analytics.mrr}`, color: 'bg-purple-50 text-purple-700' },
    { label: 'Signups This Month', value: analytics.signups_this_month, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Total Visits (All Time)', value: analytics.total_visits_all_time.toLocaleString(), color: 'bg-gray-50 text-gray-700' },
    { label: 'Visits This Month', value: analytics.visits_this_month.toLocaleString(), color: 'bg-teal-50 text-teal-700' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
