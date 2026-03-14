'use client';

import { useState, useEffect } from 'react';
import type { ServiceVisit, VisitStatus } from '@/types/b2b';

export default function VisitsTab() {
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');
  const [visits, setVisits] = useState<ServiceVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/b2b/client/visits?type=${viewMode}`);
      const result = await response.json();
      if (result.success) setVisits(result.data);
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [viewMode]);

  const statusBadge = (status: VisitStatus) => {
    const colors: Record<VisitStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      en_route: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      skipped: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading visits...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">
            {viewMode === 'upcoming' ? 'No upcoming visits' : 'No visit history'}
          </p>
          <p className="text-sm text-gray-500">
            {viewMode === 'upcoming'
              ? 'Your next service visits will appear here once scheduled.'
              : 'Your completed service visits will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map(visit => (
            <div
              key={visit.id}
              className={`border rounded-lg p-4 ${
                visit.status === 'completed' ? 'border-green-200 bg-green-50' :
                visit.status === 'in_progress' ? 'border-orange-200 bg-orange-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {new Date(visit.scheduled_date).toLocaleDateString('en-AU', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {statusBadge(visit.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    {visit.scheduled_time_window && (
                      <p className="capitalize">Time: {visit.scheduled_time_window}</p>
                    )}
                    {visit.status === 'completed' && visit.knives_sharpened !== null && (
                      <p className="text-green-700">{visit.knives_sharpened} knives sharpened</p>
                    )}
                    {visit.notes && (
                      <p className="text-gray-600">{visit.notes}</p>
                    )}
                  </div>
                </div>
                {visit.visit_amount !== null && (
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${visit.visit_amount.toFixed(2)}</p>
                    {visit.billed && (
                      <p className="text-xs text-green-600">Billed</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
