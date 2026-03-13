'use client';

import { useState, useEffect } from 'react';
import type { Client, ServiceVisit } from '@/types/b2b';

interface VisitWithClientData extends ServiceVisit {
  client?: Pick<Client, 'id' | 'business_name' | 'contact_name' | 'phone' | 'address_line1' | 'suburb' | 'latitude' | 'longitude'>;
}

export default function RoutesTab() {
  const [visits, setVisits] = useState<VisitWithClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchVisits = async () => {
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
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedDate]);

  const activeVisits = visits.filter(v => !['cancelled', 'skipped'].includes(v.status));
  const completedCount = activeVisits.filter(v => v.status === 'completed').length;
  const totalStops = activeVisits.length;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daily Route</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            &larr;
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            &rarr;
          </button>
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalStops > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Route Progress</span>
            <span>{completedCount} / {totalStops} stops</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalStops > 0 ? (completedCount / totalStops) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading route...</div>
      ) : activeVisits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No route for this day</p>
          <p className="text-sm text-gray-500">No visits scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Route line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

          <div className="space-y-4">
            {activeVisits.map((visit, index) => {
              const isCompleted = visit.status === 'completed';
              const isCurrent = visit.status === 'in_progress' || visit.status === 'en_route';

              return (
                <div key={visit.id} className="relative flex items-start gap-4">
                  {/* Stop marker */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-orange-500 border-orange-500 text-white animate-pulse'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? '\u2713' : index + 1}
                  </div>

                  {/* Stop details */}
                  <div className={`flex-1 bg-white border rounded-lg p-4 ${
                    isCurrent ? 'border-orange-300 shadow-md' : isCompleted ? 'border-green-200' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {visit.client?.business_name || 'Unknown'}
                        </h3>
                        {visit.client?.address_line1 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {visit.client.address_line1}, {visit.client.suburb}
                          </p>
                        )}
                        {visit.client?.phone && (
                          <p className="text-sm text-gray-500">{visit.client.contact_name} &bull; {visit.client.phone}</p>
                        )}
                        {visit.scheduled_time_window && (
                          <p className="text-xs text-gray-400 mt-1 capitalize">{visit.scheduled_time_window}</p>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    {isCompleted && visit.knives_sharpened !== null && (
                      <p className="text-sm text-green-600 mt-2">
                        {visit.knives_sharpened} knives sharpened
                        {visit.completed_at && ` at ${new Date(visit.completed_at).toLocaleTimeString()}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
