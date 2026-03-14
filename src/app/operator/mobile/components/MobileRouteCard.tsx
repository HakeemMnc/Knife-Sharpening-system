'use client';

import type { VisitStatus, Client, ServiceVisit } from '@/types/b2b';

export interface VisitWithClientData extends ServiceVisit {
  client?: Pick<Client, 'id' | 'business_name' | 'contact_name' | 'phone' | 'address_line1' | 'suburb' | 'latitude' | 'longitude' | 'access_instructions'>;
}

interface MobileRouteCardProps {
  visit: VisitWithClientData;
  index: number;
  onStatusChange: (visitId: string, status: VisitStatus) => void;
  onOpenDetail: (visit: VisitWithClientData) => void;
  updating: string | null;
}

export default function MobileRouteCard({ visit, index, onStatusChange, onOpenDetail, updating }: MobileRouteCardProps) {
  const isCompleted = visit.status === 'completed';
  const isCurrent = visit.status === 'in_progress' || visit.status === 'en_route';
  const isUpdating = updating === visit.id;

  const nextAction = (): { label: string; status: VisitStatus; color: string } | null => {
    switch (visit.status) {
      case 'scheduled':
        return { label: 'Start Route', status: 'en_route', color: 'bg-yellow-500 active:bg-yellow-600' };
      case 'en_route':
        return { label: 'Arrived', status: 'in_progress', color: 'bg-orange-500 active:bg-orange-600' };
      case 'in_progress':
        return { label: 'Complete', status: 'completed', color: 'bg-green-500 active:bg-green-600' };
      default:
        return null;
    }
  };

  const action = nextAction();

  const buildNavigationUrl = () => {
    if (visit.client?.latitude && visit.client?.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${visit.client.latitude},${visit.client.longitude}`;
    }
    if (visit.client?.address_line1) {
      const address = encodeURIComponent(
        `${visit.client.address_line1}, ${visit.client.suburb || ''}`
      );
      return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    }
    return null;
  };

  const navUrl = buildNavigationUrl();

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isCurrent
          ? 'border-orange-400 bg-orange-50 shadow-lg'
          : isCompleted
          ? 'border-green-300 bg-green-50 opacity-75'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isCurrent
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isCompleted ? '\u2713' : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {visit.client?.business_name || 'Unknown Client'}
          </h3>
          {visit.client?.address_line1 && (
            <p className="text-sm text-gray-500 truncate">
              {visit.client.address_line1}, {visit.client.suburb}
            </p>
          )}
        </div>
        {isCurrent && (
          <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold flex-shrink-0">
            NOW
          </span>
        )}
      </div>

      {/* Contact + time info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        {visit.client?.contact_name && (
          <span>{visit.client.contact_name}</span>
        )}
        {visit.scheduled_time_window && (
          <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-xs">
            {visit.scheduled_time_window}
          </span>
        )}
      </div>

      {/* Completed info */}
      {isCompleted && visit.knives_sharpened !== null && (
        <div className="text-sm text-green-700 mb-3">
          {visit.knives_sharpened} knives sharpened
          {visit.completed_at && ` \u2022 ${new Date(visit.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </div>
      )}

      {/* Action buttons — large touch targets */}
      <div className="flex gap-2">
        {/* Navigate button */}
        {navUrl && !isCompleted && (
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 active:bg-blue-600 text-white py-3 rounded-lg font-medium text-sm min-h-[48px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Navigate
          </a>
        )}

        {/* Call button */}
        {visit.client?.phone && !isCompleted && (
          <a
            href={`tel:${visit.client.phone}`}
            className="flex items-center justify-center gap-2 bg-gray-200 active:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium text-sm min-h-[48px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        )}

        {/* Status action button */}
        {action && (
          <button
            onClick={() => onStatusChange(visit.id, action.status)}
            disabled={isUpdating}
            className={`flex-1 ${action.color} text-white py-3 rounded-lg font-bold text-sm min-h-[48px] disabled:opacity-50`}
          >
            {isUpdating ? 'Updating...' : action.label}
          </button>
        )}

        {/* Detail/edit button for in_progress visits */}
        {visit.status === 'in_progress' && (
          <button
            onClick={() => onOpenDetail(visit)}
            className="flex items-center justify-center bg-gray-200 active:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium text-sm min-h-[48px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Skip button for scheduled visits */}
        {visit.status === 'scheduled' && (
          <button
            onClick={() => onStatusChange(visit.id, 'skipped')}
            disabled={isUpdating}
            className="flex items-center justify-center bg-gray-200 active:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium text-sm min-h-[48px] disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
