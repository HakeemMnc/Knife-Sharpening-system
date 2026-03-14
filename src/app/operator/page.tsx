'use client';

import { useState, useEffect } from 'react';
import ClientsTab from './components/ClientsTab';
import ContractsTab from './components/ContractsTab';
import ScheduleTab from './components/ScheduleTab';
import RoutesTab from './components/RoutesTab';
import SettingsTab from './components/SettingsTab';

type Tab = 'clients' | 'contracts' | 'schedule' | 'routes' | 'settings';

interface TenantData {
  id: string;
  name: string;
  status: string;
}

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/b2b/tenants');
        const result = await response.json();
        if (result.success && result.data) {
          setTenant(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Business Found</h1>
          <p className="text-gray-600 mb-6">You need to set up your business first.</p>
          <a
            href="/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </a>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'clients', label: 'Clients' },
    { key: 'contracts', label: 'Contracts' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'routes', label: 'Routes' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                {tenant.name}
              </h1>
              <a
                href="/operator/mobile"
                className="text-xs text-blue-600 font-medium hover:text-blue-800 md:hidden"
              >
                Switch to Mobile View &rarr;
              </a>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              tenant.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {tenant.status}
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'contracts' && <ContractsTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
