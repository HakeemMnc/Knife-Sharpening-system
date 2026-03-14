'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import type { Client, ServiceContract, ServiceVisit } from '@/types/b2b';
import DashboardTab from './components/DashboardTab';
import VisitsTab from './components/VisitsTab';
import BillingTab from './components/BillingTab';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = 'dashboard' | 'visits' | 'billing' | 'profile';

interface ClientData {
  client: Client;
  activeContract: ServiceContract | null;
  stats: {
    upcomingVisits: number;
    completedVisits: number;
    totalSpent: number;
  };
}

export default function ClientPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [upcomingVisits, setUpcomingVisits] = useState<ServiceVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    contact_name: '',
    phone: '',
    email: '',
    access_instructions: '',
    preferred_day: '',
    preferred_time_window: '',
  });
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/client-login');
        return;
      }

      try {
        const [clientRes, visitsRes] = await Promise.all([
          fetch('/api/b2b/client', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch('/api/b2b/client/visits?type=upcoming', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

        const clientResult = await clientRes.json();
        const visitsResult = await visitsRes.json();

        if (!clientRes.ok) {
          setError(clientResult.error || 'Access denied');
          return;
        }

        if (clientResult.success) {
          setClientData(clientResult.data);
          setProfileForm({
            contact_name: clientResult.data.client.contact_name || '',
            phone: clientResult.data.client.phone || '',
            email: clientResult.data.client.email || '',
            access_instructions: clientResult.data.client.access_instructions || '',
            preferred_day: clientResult.data.client.preferred_day || '',
            preferred_time_window: clientResult.data.client.preferred_time_window || '',
          });
        }
        if (visitsResult.success) {
          setUpcomingVisits(visitsResult.data);
        }
      } catch {
        setError('Failed to load client portal');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/client-login');
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/b2b/client', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        setProfileMessage('Profile updated successfully');
        setEditingProfile(false);
      } else {
        const result = await response.json();
        setProfileMessage(result.error || 'Failed to update profile');
      }
    } catch {
      setProfileMessage('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/client-login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!clientData) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'visits', label: 'Visits' },
    { key: 'billing', label: 'Billing' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {clientData.client.business_name}
              </h1>
              <p className="text-sm text-gray-500">Client Portal</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Sign Out
            </button>
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

          {activeTab === 'dashboard' && (
            <DashboardTab
              client={clientData.client}
              activeContract={clientData.activeContract}
              stats={clientData.stats}
              upcomingVisits={upcomingVisits}
            />
          )}
          {activeTab === 'visits' && <VisitsTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-lg font-semibold">Your Profile</h2>

              {profileMessage && (
                <div className={`p-3 rounded text-sm ${
                  profileMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {profileMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={profileForm.contact_name}
                    onChange={e => setProfileForm(prev => ({ ...prev, contact_name: e.target.value }))}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Day</label>
                    <select
                      value={profileForm.preferred_day}
                      onChange={e => setProfileForm(prev => ({ ...prev, preferred_day: e.target.value }))}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="">No preference</option>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                    <select
                      value={profileForm.preferred_time_window}
                      onChange={e => setProfileForm(prev => ({ ...prev, preferred_time_window: e.target.value }))}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="">No preference</option>
                      <option value="morning">Morning</option>
                      <option value="midday">Midday</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Instructions</label>
                  <textarea
                    value={profileForm.access_instructions}
                    onChange={e => setProfileForm(prev => ({ ...prev, access_instructions: e.target.value }))}
                    disabled={!editingProfile}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    placeholder="e.g., Enter through back door, ask for chef"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {editingProfile ? (
                  <>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSave}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
