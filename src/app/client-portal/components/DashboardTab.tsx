'use client';

import type { Client, ServiceContract, ServiceVisit } from '@/types/b2b';

interface DashboardTabProps {
  client: Client;
  activeContract: ServiceContract | null;
  stats: {
    upcomingVisits: number;
    completedVisits: number;
    totalSpent: number;
  };
  upcomingVisits: ServiceVisit[];
}

export default function DashboardTab({ client, activeContract, stats, upcomingVisits }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Upcoming Visits</p>
          <p className="text-2xl font-bold text-blue-900">{stats.upcomingVisits}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Completed Visits</p>
          <p className="text-2xl font-bold text-green-900">{stats.completedVisits}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-purple-900">${stats.totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Active Contract */}
      {activeContract && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Service Contract</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="capitalize">{activeContract.frequency} service</span>
            {activeContract.day_of_week && (
              <span className="capitalize">Every {activeContract.day_of_week}</span>
            )}
            <span>${activeContract.price_per_visit}/visit</span>
            <span>~{activeContract.estimated_knives_per_visit} knives</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>
      )}

      {/* Next Visits */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Next Scheduled Visits</h3>
        {upcomingVisits.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming visits scheduled.</p>
        ) : (
          <div className="space-y-2">
            {upcomingVisits.slice(0, 5).map(visit => (
              <div key={visit.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(visit.scheduled_date).toLocaleDateString('en-AU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  {visit.scheduled_time_window && (
                    <p className="text-sm text-gray-500 capitalize">{visit.scheduled_time_window}</p>
                  )}
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {visit.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Business Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Business Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Business</p>
            <p className="font-medium">{client.business_name}</p>
          </div>
          {client.contact_name && (
            <div>
              <p className="text-gray-500">Contact</p>
              <p className="font-medium">{client.contact_name}</p>
            </div>
          )}
          {client.address_line1 && (
            <div>
              <p className="text-gray-500">Address</p>
              <p className="font-medium">{client.address_line1}, {client.suburb}</p>
            </div>
          )}
          {client.phone && (
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
