'use client';

import { useState, useEffect } from 'react';
import type { ServiceVisit, VisitStatus, Client } from '@/types/b2b';

interface VisitWithClientData extends ServiceVisit {
  client?: Pick<Client, 'id' | 'business_name' | 'contact_name' | 'phone' | 'address_line1' | 'suburb'>;
}

export default function ScheduleTab() {
  const [visits, setVisits] = useState<VisitWithClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      let url: string;
      if (viewMode === 'day') {
        url = `/api/b2b/visits?date=${selectedDate}`;
      } else {
        const start = new Date(selectedDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        url = `/api/b2b/visits?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`;
      }

      const response = await fetch(url);
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
  }, [selectedDate, viewMode]);

  const updateStatus = async (visitId: string, status: VisitStatus) => {
    try {
      await fetch(`/api/b2b/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchVisits();
    } catch (err) {
      console.error('Failed to update visit:', err);
    }
  };

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (viewMode === 'week' ? direction * 7 : direction));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

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

  const statusActions = (visit: VisitWithClientData) => {
    const actions: { label: string; status: VisitStatus; color: string }[] = [];

    switch (visit.status) {
      case 'scheduled':
        actions.push({ label: 'Start Route', status: 'en_route', color: 'bg-yellow-500 hover:bg-yellow-600' });
        actions.push({ label: 'Skip', status: 'skipped', color: 'bg-gray-500 hover:bg-gray-600' });
        break;
      case 'en_route':
        actions.push({ label: 'Arrived', status: 'in_progress', color: 'bg-orange-500 hover:bg-orange-600' });
        break;
      case 'in_progress':
        actions.push({ label: 'Complete', status: 'completed', color: 'bg-green-500 hover:bg-green-600' });
        break;
    }

    return actions;
  };

  const handleGenerateVisits = async () => {
    setGenerating(true);
    setGenerateMessage('');
    try {
      const response = await fetch('/api/b2b/visits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeks_ahead: 4 }),
      });
      const result = await response.json();
      if (result.success) {
        setGenerateMessage(`Generated ${result.data.generated} visits from ${result.data.contracts?.length || 0} contracts`);
        fetchVisits();
      } else {
        setGenerateMessage(result.error || 'Failed to generate visits');
      }
    } catch {
      setGenerateMessage('Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Schedule</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Week
            </button>
          </div>
          <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-gray-100 rounded">
            &larr;
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <button onClick={() => navigateDate(1)} className="p-1 hover:bg-gray-100 rounded">
            &rarr;
          </button>
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
            >
              Today
            </button>
          )}
          <button
            onClick={handleGenerateVisits}
            disabled={generating}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Visits'}
          </button>
        </div>
      </div>

      {generateMessage && (
        <div className={`p-3 rounded text-sm ${
          generateMessage.includes('Generated') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {generateMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading schedule...</div>
      ) : visits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No visits scheduled</p>
          <p className="text-sm text-gray-500">
            {viewMode === 'day'
              ? `Nothing on ${new Date(selectedDate).toLocaleDateString()}`
              : 'No visits this week'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit, index) => (
            <div
              key={visit.id}
              className={`bg-white border rounded-lg p-4 ${
                visit.status === 'completed' ? 'border-green-200 bg-green-50' :
                visit.status === 'in_progress' ? 'border-orange-200 bg-orange-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400">#{visit.route_order || index + 1}</span>
                    <h3 className="font-medium text-gray-900">
                      {visit.client?.business_name || 'Unknown Client'}
                    </h3>
                    {statusBadge(visit.status)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    {visit.client?.address_line1 && (
                      <p>{visit.client.address_line1}, {visit.client.suburb}</p>
                    )}
                    {visit.client?.contact_name && (
                      <p>{visit.client.contact_name} {visit.client?.phone ? `• ${visit.client.phone}` : ''}</p>
                    )}
                    {visit.scheduled_time_window && (
                      <p className="capitalize">Time: {visit.scheduled_time_window}</p>
                    )}
                    {viewMode === 'week' && (
                      <p>{new Date(visit.scheduled_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    )}
                    {visit.status === 'completed' && visit.knives_sharpened !== null && (
                      <p className="text-green-700">{visit.knives_sharpened} knives sharpened</p>
                    )}
                    {visit.status === 'completed' && (
                      <p className={visit.billed ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                        {visit.billed ? 'Billed' : 'Unbilled'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {statusActions(visit).map(action => (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(visit.id, action.status)}
                      className={`${action.color} text-white px-3 py-1 rounded text-sm`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {visits.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 flex gap-6 text-sm">
          <span>Total: <strong>{visits.length}</strong> visits</span>
          <span>Completed: <strong>{visits.filter(v => v.status === 'completed').length}</strong></span>
          <span>Remaining: <strong>{visits.filter(v => ['scheduled', 'en_route', 'in_progress'].includes(v.status)).length}</strong></span>
        </div>
      )}
    </div>
  );
}
