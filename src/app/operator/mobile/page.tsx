'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { VisitStatus } from '@/types/b2b';
import MobileRouteCard from './components/MobileRouteCard';
import MobileVisitDetail from './components/MobileVisitDetail';
import type { VisitWithClientData } from './components/MobileRouteCard';

export default function MobileRoutePage() {
  const router = useRouter();
  const [visits, setVisits] = useState<VisitWithClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenantName, setTenantName] = useState('');
  const [updatingVisit, setUpdatingVisit] = useState<string | null>(null);
  const [detailVisit, setDetailVisit] = useState<VisitWithClientData | null>(null);
  const [savingDetail, setSavingDetail] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/b2b/visits?date=${selectedDate}`);
      const result = await response.json();
      if (result.success) setVisits(result.data);
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch('/api/b2b/tenants');
        const result = await response.json();
        if (result.success && result.data) {
          setTenantName(result.data.name);
        } else {
          router.push('/onboarding');
        }
      } catch {
        // tenant fetch failed
      }
    };
    fetchTenant();
  }, [router]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleStatusChange = async (visitId: string, status: VisitStatus) => {
    setUpdatingVisit(visitId);
    try {
      await fetch(`/api/b2b/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchVisits();
    } catch (err) {
      console.error('Failed to update visit:', err);
    } finally {
      setUpdatingVisit(null);
    }
  };

  const handleSaveAndComplete = async (visitId: string, data: { knives_sharpened: number; notes: string }) => {
    setSavingDetail(true);
    try {
      await fetch(`/api/b2b/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed' as VisitStatus,
          knives_sharpened: data.knives_sharpened,
          notes: data.notes || null,
        }),
      });
      setDetailVisit(null);
      await fetchVisits();
    } catch (err) {
      console.error('Failed to complete visit:', err);
    } finally {
      setSavingDetail(false);
    }
  };

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const activeVisits = visits.filter(v => !['cancelled', 'skipped'].includes(v.status));
  const completedCount = activeVisits.filter(v => v.status === 'completed').length;
  const totalStops = activeVisits.length;
  const progressPercent = totalStops > 0 ? Math.round((completedCount / totalStops) * 100) : 0;

  const currentVisit = activeVisits.find(v => v.status === 'in_progress' || v.status === 'en_route');

  const dateLabel = () => {
    if (selectedDate === today) return 'Today';
    const d = new Date(selectedDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selectedDate === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{tenantName || 'Loading...'}</h1>
              <p className="text-xs text-gray-500">Mobile Route View</p>
            </div>
            <a
              href="/operator"
              className="text-sm text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              Desktop
            </a>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedDate(today)}
              className="text-center"
            >
              <span className="text-base font-semibold text-gray-900">{dateLabel()}</span>
              {selectedDate !== today && (
                <span className="block text-xs text-blue-600 font-medium">Tap for today</span>
              )}
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="w-10 h-10 flex items-center justify-center rounded-lg active:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {totalStops > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{completedCount} of {totalStops} stops complete</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current visit highlight */}
      {currentVisit && (
        <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-80">Current Stop</p>
            <p className="font-bold">{currentVisit.client?.business_name}</p>
          </div>
          {currentVisit.client?.address_line1 && (
            <a
              href={
                currentVisit.client.latitude && currentVisit.client.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${currentVisit.client.latitude},${currentVisit.client.longitude}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${currentVisit.client.address_line1}, ${currentVisit.client.suburb || ''}`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 active:bg-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm min-h-[44px] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Navigate
            </a>
          )}
        </div>
      )}

      {/* Visit list */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading route...</div>
        ) : activeVisits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">&#128203;</div>
            <p className="text-gray-600 font-medium">No stops {selectedDate === today ? 'today' : 'this day'}</p>
            <p className="text-sm text-gray-500 mt-1">
              Check the schedule or generate visits from the desktop view.
            </p>
          </div>
        ) : (
          activeVisits.map((visit, index) => (
            <MobileRouteCard
              key={visit.id}
              visit={visit}
              index={index}
              onStatusChange={handleStatusChange}
              onOpenDetail={setDetailVisit}
              updating={updatingVisit}
            />
          ))
        )}

        {/* Skipped visits summary */}
        {visits.filter(v => v.status === 'skipped').length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-500">
            {visits.filter(v => v.status === 'skipped').length} visit(s) skipped
          </div>
        )}
      </div>

      {/* Route complete celebration */}
      {totalStops > 0 && completedCount === totalStops && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 text-center z-30">
          <p className="font-bold text-lg">Route Complete! &#127881;</p>
          <p className="text-sm opacity-90">{totalStops} stops finished for {dateLabel()}</p>
        </div>
      )}

      {/* Visit detail modal */}
      {detailVisit && (
        <MobileVisitDetail
          visit={detailVisit}
          onClose={() => setDetailVisit(null)}
          onSaveAndComplete={handleSaveAndComplete}
          saving={savingDetail}
        />
      )}
    </div>
  );
}
