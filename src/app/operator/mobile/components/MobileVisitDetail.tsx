'use client';

import { useState } from 'react';
import type { VisitWithClientData } from './MobileRouteCard';

interface MobileVisitDetailProps {
  visit: VisitWithClientData;
  onClose: () => void;
  onSaveAndComplete: (visitId: string, data: { knives_sharpened: number; notes: string }) => void;
  saving: boolean;
}

export default function MobileVisitDetail({ visit, onClose, onSaveAndComplete, saving }: MobileVisitDetailProps) {
  const [knivesSharpened, setKnivesSharpened] = useState(
    visit.knives_sharpened ?? visit.contract_id ? 0 : 0
  );
  const [notes, setNotes] = useState(visit.notes || '');

  const quickCounts = [5, 10, 15, 20, 25, 30];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {visit.client?.business_name || 'Visit Details'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Client info */}
          {visit.client?.access_instructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs font-medium text-yellow-800 mb-1">Access Instructions</p>
              <p className="text-sm text-yellow-900">{visit.client.access_instructions}</p>
            </div>
          )}

          {/* Knives count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Knives Sharpened
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {quickCounts.map(count => (
                <button
                  key={count}
                  onClick={() => setKnivesSharpened(count)}
                  className={`py-3 rounded-lg font-bold text-lg min-h-[48px] ${
                    knivesSharpened === count
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setKnivesSharpened(Math.max(0, knivesSharpened - 1))}
                className="w-12 h-12 rounded-lg bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-xl flex items-center justify-center"
              >
                -
              </button>
              <input
                type="number"
                value={knivesSharpened}
                onChange={e => setKnivesSharpened(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg py-3 focus:border-blue-500 focus:outline-none"
                min={0}
              />
              <button
                onClick={() => setKnivesSharpened(knivesSharpened + 1)}
                className="w-12 h-12 rounded-lg bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-xl flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
              placeholder="Any notes about this visit..."
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 active:bg-gray-300 text-gray-700 py-4 rounded-xl font-medium text-base min-h-[56px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSaveAndComplete(visit.id, { knives_sharpened: knivesSharpened, notes })}
            disabled={saving}
            className="flex-1 bg-green-500 active:bg-green-600 text-white py-4 rounded-xl font-bold text-base min-h-[56px] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Complete Visit'}
          </button>
        </div>
      </div>
    </div>
  );
}
