'use client';

import { useState } from 'react';
import TenantsTab from './components/TenantsTab';
import AnalyticsTab from './components/AnalyticsTab';

type Tab = 'analytics' | 'tenants';

export default function PlatformAdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'tenants', label: 'Operators' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
          <div className="mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">
              Platform Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage operators, monitor platform health, and track revenue.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'tenants' && <TenantsTab />}
        </div>
      </div>
    </div>
  );
}
